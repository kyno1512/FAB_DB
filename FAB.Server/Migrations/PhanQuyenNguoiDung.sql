-- Tạo bảng PhanQuyenNguoiDung để lưu quyền riêng cho từng nhân sự
-- Override quyền mặc định của vai trò

CREATE TABLE PhanQuyenNguoiDung (
    MaPhanQuyen INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaQuyen INT NOT NULL,
    Tat BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_PhanQuyenNguoiDung_NguoiDung FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    CONSTRAINT FK_PhanQuyenNguoiDung_Quyen FOREIGN KEY (MaQuyen) REFERENCES Quyen(MaQuyen) ON DELETE CASCADE,
    CONSTRAINT UQ_PhanQuyenNguoiDung UNIQUE (MaNguoiDung, MaQuyen)
);

-- Index để tìm kiếm nhanh theo nhân sự
CREATE INDEX IX_PhanQuyenNguoiDung_MaNguoiDung ON PhanQuyenNguoiDung(MaNguoiDung);
