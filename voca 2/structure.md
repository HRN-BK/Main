-- Bật RLS cho tất cả các bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Tạo bảng profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng folders
CREATE TABLE public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng notes
CREATE TABLE public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng tags
CREATE TABLE public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng note_tags
CREATE TABLE public.note_tags (
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (note_id, tag_id)
);

-- Tạo function để cập nhật updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger cho các bảng cần updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tạo chính sách bảo mật cho profiles
CREATE POLICY "Người dùng có thể xem hồ sơ của chính họ" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Người dùng có thể cập nhật hồ sơ của chính họ"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Chính sách cho folders
CREATE POLICY "Người dùng có thể xem thư mục của họ"
ON public.folders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể tạo thư mục"
ON public.folders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể cập nhật thư mục của họ"
ON public.folders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể xóa thư mục của họ"
ON public.folders FOR DELETE
USING (auth.uid() = user_id);

-- Chính sách cho notes
CREATE POLICY "Người dùng có thể xem ghi chú của họ"
ON public.notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể tạo ghi chú"
ON public.notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể cập nhật ghi chú của họ"
ON public.notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể xóa ghi chú của họ"
ON public.notes FOR DELETE
USING (auth.uid() = user_id);

-- Chính sách cho tags
CREATE POLICY "Người dùng có thể xem thẻ của họ"
ON public.tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể tạo thẻ"
ON public.tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể cập nhật thẻ của họ"
ON public.tags FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Người dùng có thể xóa thẻ của họ"
ON public.tags FOR DELETE
USING (auth.uid() = user_id);

-- Chính sách cho note_tags
CREATE POLICY "Người dùng có thể xem các mối quan hệ note-tag của họ"
ON public.note_tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.notes
  WHERE id = note_id AND user_id = auth.uid()
));

CREATE POLICY "Người dùng có thể tạo mối quan hệ note-tag"
ON public.note_tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.notes
  WHERE id = note_id AND user_id = auth.uid()
));

CREATE POLICY "Người dùng có thể xóa mối quan hệ note-tag của họ"
ON public.note_tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.notes
  WHERE id = note_id AND user_id = auth.uid()
));