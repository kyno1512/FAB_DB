using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using FAB.Server.Models;

namespace FAB.Server.Context;

public partial class FabDbContext : DbContext
{
    public FabDbContext()
    {
    }

    public FabDbContext(DbContextOptions<FabDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AiduBaoTonKho> AiduBaoTonKhos { get; set; }

    public virtual DbSet<ChiTietDonDatHangNhap> ChiTietDonDatHangNhaps { get; set; }

    public virtual DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }

    public virtual DbSet<ChiTietGioHang> ChiTietGioHangs { get; set; }

    public virtual DbSet<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; }

    public virtual DbSet<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; }

    public virtual DbSet<ComboChiTiet> ComboChiTiets { get; set; }

    public virtual DbSet<CongThucSanPham> CongThucSanPhams { get; set; }

    public virtual DbSet<DanhMuc> DanhMucs { get; set; }

    public virtual DbSet<DanhGiaSanPham> DanhGiaSanPhams { get; set; }

    public virtual DbSet<DonDatHangNhap> DonDatHangNhaps { get; set; }

    public virtual DbSet<DonHang> DonHangs { get; set; }

    public virtual DbSet<GioHang> GioHangs { get; set; }

    public virtual DbSet<GiaoHang> GiaoHangs { get; set; }

    public virtual DbSet<HinhAnhSanPham> HinhAnhSanPhams { get; set; }

    public virtual DbSet<HoaDon> HoaDons { get; set; }

    public virtual DbSet<KhachHang> KhachHangs { get; set; }

    public virtual DbSet<GiaSanPhamTheoSize> GiaSanPhamTheoSizes { get; set; }

    public virtual DbSet<LichSuChatAi> LichSuChatAis { get; set; }

    public virtual DbSet<LichSuHoanTien> LichSuHoanTiens { get; set; }

    public virtual DbSet<LichSuTonKho> LichSuTonKhos { get; set; }

    public virtual DbSet<Lo> Los { get; set; }

    public virtual DbSet<MaGiamGia> MaGiamGia { get; set; }

    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }

    public virtual DbSet<NguyenLieu> NguyenLieus { get; set; }

    public virtual DbSet<NguyenLieuNcc> NguyenLieuNccs { get; set; }

    public virtual DbSet<NhaCungCap> NhaCungCaps { get; set; }

    public virtual DbSet<PhanQuyenNguoiDung> PhanQuyenNguoiDungs { get; set; }

    public virtual DbSet<PhieuNhapKho> PhieuNhapKhos { get; set; }

    public virtual DbSet<PhieuXuatKho> PhieuXuatKhos { get; set; }

    public virtual DbSet<Quyen> Quyens { get; set; }

    public virtual DbSet<SanPham> SanPhams { get; set; }

    public virtual DbSet<SanPhamTopping> SanPhamToppings { get; set; }

    public virtual DbSet<Size> Sizes { get; set; }

    public virtual DbSet<ThanhToan> ThanhToans { get; set; }

    public virtual DbSet<TinTuc> TinTucs { get; set; }

    public virtual DbSet<Topping> Toppings { get; set; }

    public virtual DbSet<VaiTro> VaiTros { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:Connection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AiduBaoTonKho>(entity =>
        {
            entity.HasKey(e => e.MaDuBao).HasName("PK__AIDuBaoT__03C13C223BCA92C8");

            entity.ToTable("AIDuBaoTonKho");

            entity.Property(e => e.DoChinhXac).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.MoHinhSuDung).HasMaxLength(100);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoLuongDuBao).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.SoLuongThucTe).HasColumnType("decimal(18, 3)");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.AiduBaoTonKhos)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AIDuBaoTo__MaNgu__41EDCAC5");
        });

        modelBuilder.Entity<ChiTietDonDatHangNhap>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PK__ChiTietD__CDF0A114DAA6EB4C");

            entity.ToTable("ChiTietDonDatHangNhap");

            entity.Property(e => e.DonGia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoLuong).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.ThanhTien)
                .HasComputedColumnSql("([SoLuong]*[DonGia])", true)
                .HasColumnType("decimal(37, 5)");

            entity.HasOne(d => d.MaDonDatHangNavigation).WithMany(p => p.ChiTietDonDatHangNhaps)
                .HasForeignKey(d => d.MaDonDatHang)
                .HasConstraintName("FK__ChiTietDo__MaDon__0C85DE4D");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.ChiTietDonDatHangNhaps)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietDo__MaNgu__0D7A0286");
        });

        modelBuilder.Entity<ChiTietDonHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PK__ChiTietD__CDF0A114E14F54AA");

            entity.ToTable("ChiTietDonHang");

            entity.Property(e => e.DonGia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GhiChu).HasMaxLength(255);
            entity.Property(e => e.SoLuong).HasDefaultValue(1);
            entity.Property(e => e.ThanhTien)
                .HasComputedColumnSql("([SoLuong]*[DonGia])", true)
                .HasColumnType("decimal(29, 2)");

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.ChiTietDonHangs)
                .HasForeignKey(d => d.MaDonHang)
                .HasConstraintName("FK__ChiTietDo__MaDon__2739D489");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.ChiTietDonHangs)
                .HasForeignKey(d => d.MaSanPham)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietDo__MaSan__282DF8C2");
        });

        modelBuilder.Entity<ChiTietPhieuNhapKho>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PK__ChiTietP__CDF0A11486C59308");

            entity.ToTable("ChiTietPhieuNhapKho");

            entity.Property(e => e.DonGia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoLuong).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.ThanhTien)
                .HasComputedColumnSql("([SoLuong]*[DonGia])", true)
                .HasColumnType("decimal(37, 5)");

            entity.HasOne(d => d.MaLoNavigation).WithMany(p => p.ChiTietPhieuNhapKhos)
                .HasForeignKey(d => d.MaLo)
                .HasConstraintName("FK__ChiTietPh__MaLo__7E4B8F4A");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.ChiTietPhieuNhapKhos)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietPh__MaNgu__75A278F5");

            entity.HasOne(d => d.MaPhieuNhapNavigation).WithMany(p => p.ChiTietPhieuNhapKhos)
                .HasForeignKey(d => d.MaPhieuNhap)
                .HasConstraintName("FK__ChiTietPh__MaPhi__74AE54BC");
        });

        modelBuilder.Entity<ChiTietPhieuXuatKho>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PK__ChiTietP__CDF0A114EB0FBDF5");

            entity.ToTable("ChiTietPhieuXuatKho");

            entity.Property(e => e.DonGia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GhiChu).HasMaxLength(255);
            entity.Property(e => e.SoLuong).HasColumnType("decimal(18, 3)");

            entity.HasOne(d => d.MaLoNavigation).WithMany(p => p.ChiTietPhieuXuatKhos)
                .HasForeignKey(d => d.MaLo)
                .HasConstraintName("FK__ChiTietPh__MaLo__7F3B9F83");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.ChiTietPhieuXuatKhos)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietPh__MaNgu__7E37BEF6");

            entity.HasOne(d => d.MaPhieuXuatNavigation).WithMany(p => p.ChiTietPhieuXuatKhos)
                .HasForeignKey(d => d.MaPhieuXuat)
                .HasConstraintName("FK__ChiTietPh__MaPhi__7D439ABD");
        });

        modelBuilder.Entity<CongThucSanPham>(entity =>
        {
            entity.HasKey(e => e.MaCongThuc).HasName("PK__CongThuc__6E223AF754451582");

            entity.ToTable("CongThucSanPham");

            entity.Property(e => e.DonVi).HasMaxLength(50);
            entity.Property(e => e.GhiChu).HasMaxLength(255);
            entity.Property(e => e.SoLuong).HasColumnType("decimal(18, 3)");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.CongThucSanPhams)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CongThucS__MaNgu__6754599E");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.CongThucSanPhams)
                .HasForeignKey(d => d.MaSanPham)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CongThucS__MaSan__66603565");
        });

        modelBuilder.Entity<DanhMuc>(entity =>
        {
            entity.HasKey(e => e.MaDanhMuc).HasName("PK__DanhMuc__B3750887EB1EEF4D");

            entity.ToTable("DanhMuc");

            entity.Property(e => e.HinhAnh).HasMaxLength(500);
            entity.Property(e => e.MoTa).HasMaxLength(500);
            entity.Property(e => e.TenDanhMuc).HasMaxLength(150);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
            entity.Property(e => e.CoSize).HasDefaultValue(true);
        });

        modelBuilder.Entity<DonDatHangNhap>(entity =>
        {
            entity.HasKey(e => e.MaDonDatHang).HasName("PK__DonDatHa__17C939D18328AE48");

            entity.ToTable("DonDatHangNhap");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.NgayDat)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChoDuyet");

            entity.HasOne(d => d.MaNguoiTaoNavigation).WithMany(p => p.DonDatHangNhaps)
                .HasForeignKey(d => d.MaNguoiTao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatHan__MaNgu__09A971A2");

            entity.HasOne(d => d.MaNhaCungCapNavigation).WithMany(p => p.DonDatHangNhaps)
                .HasForeignKey(d => d.MaNhaCungCap)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatHan__MaNha__08B54D69");
        });

        modelBuilder.Entity<DonHang>(entity =>
        {
            entity.HasKey(e => e.MaDonHang).HasName("PK__DonHang__129584ADD986E8AC");

            entity.ToTable("DonHang");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.LoaiDonHang)
                .HasMaxLength(50)
                .HasDefaultValue("TaiCho");
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoTienGiam).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongTamTinh).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongThanhToan).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChoBep");
            entity.Property(e => e.TrackingToken).HasMaxLength(64);

            entity.HasIndex(e => e.TrackingToken)
                .IsUnique()
                .HasFilter("[TrackingToken] IS NOT NULL");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.DonHangs)
                .HasForeignKey(d => d.MaKhachHang)
                .HasConstraintName("FK__DonHang__MaKhach__2180FB33");

            entity.HasOne(d => d.MaNguoiTaoNavigation).WithMany(p => p.DonHangs)
                .HasForeignKey(d => d.MaNguoiTao)
                .HasConstraintName("FK__DonHang__MaNguoi__22751F6C");

            entity.HasOne(d => d.MaVoucherNavigation).WithMany(p => p.DonHangs)
                .HasForeignKey(d => d.MaVoucher)
                .HasConstraintName("FK__DonHang__MaVouch__236943A5");
        });

        modelBuilder.Entity<GiaoHang>(entity =>
        {
            entity.HasKey(e => e.MaGiaoHang).HasName("PK__GiaoHang__81CCF4FD0498BFBE");

            entity.ToTable("GiaoHang");

            entity.Property(e => e.DiaChiGiao).HasMaxLength(500);
            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.NgayGiao).HasColumnType("datetime");
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NguoiNhan).HasMaxLength(150);
            entity.Property(e => e.PhiGiaoHang).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SdtnguoiNhan)
                .HasMaxLength(15)
                .HasColumnName("SDTNguoiNhan");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChoLayHang");

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.GiaoHangs)
                .HasForeignKey(d => d.MaDonHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__GiaoHang__MaDonH__3A4CA8FD");

            entity.HasOne(d => d.MaShipperNavigation).WithMany()
                .HasForeignKey(d => d.MaShipper)
                .HasConstraintName("FK_GiaoHang_Shipper");
        });

        modelBuilder.Entity<GioHang>(entity =>
        {
            entity.HasKey(e => e.MaGioHang).HasName("PK__GioHang");

            entity.ToTable("GioHang");

            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NgayCapNhat)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.GioHangs)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK__GioHang__MaNguoiDung");
        });

        modelBuilder.Entity<ChiTietGioHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTiet).HasName("PK__ChiTietGioHang");

            entity.ToTable("ChiTietGioHang");

            entity.Property(e => e.SoLuong).HasDefaultValue(1);

            entity.HasOne(d => d.MaGioHangNavigation).WithMany(p => p.ChiTietGioHangs)
                .HasForeignKey(d => d.MaGioHang)
                .HasConstraintName("FK__ChiTietGioHang__MaGioHang");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.ChiTietGioHangs)
                .HasForeignKey(d => d.MaSanPham)
                .HasConstraintName("FK__ChiTietGioHang__MaSanPham");

            entity.HasOne(d => d.MaSizeNavigation).WithMany()
                .HasForeignKey(d => d.MaSize)
                .HasConstraintName("FK__ChiTietGioHang__MaSize");
        });

        modelBuilder.Entity<HinhAnhSanPham>(entity =>
        {
            entity.HasKey(e => e.MaHinhAnh).HasName("PK__HinhAnhS__A9C37A9BB1378664");

            entity.ToTable("HinhAnhSanPham");

            entity.Property(e => e.DuongDan).HasMaxLength(500);

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.HinhAnhSanPhams)
                .HasForeignKey(d => d.MaSanPham)
                .HasConstraintName("FK__HinhAnhSa__MaSan__5629CD9C");
        });

        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.MaHoaDon).HasName("PK__HoaDon__835ED13BBB10A6FB");

            entity.ToTable("HoaDon");

            entity.HasIndex(e => e.SoHoaDon, "UQ__HoaDon__012E9E531680A0A5").IsUnique();

            entity.HasIndex(e => e.MaDonHang, "UQ__HoaDon__129584AC8EE5CE08").IsUnique();

            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoHoaDon).HasMaxLength(50);
            entity.Property(e => e.SoTienGiam).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongThanhToan).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChuaThanhToan");

            entity.HasOne(d => d.MaDonHangNavigation).WithOne(p => p.HoaDon)
                .HasForeignKey<HoaDon>(d => d.MaDonHang)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HoaDon__MaDonHan__2FCF1A8A");
        });

        modelBuilder.Entity<KhachHang>(entity =>
        {
            entity.HasKey(e => e.MaKhachHang).HasName("PK__KhachHan__88D2F0E525763918");

            entity.ToTable("KhachHang");

            entity.Property(e => e.DiaChi).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.HoTen).HasMaxLength(150);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoDienThoai).HasMaxLength(15);

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.KhachHangs)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK__KhachHang__MaNgu__47DBAE45");
        });

        modelBuilder.Entity<LichSuChatAi>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuCh__C443222ABC2D70DE");

            entity.ToTable("LichSuChatAI");

            entity.Property(e => e.MaPhienChat).HasMaxLength(100);
            entity.Property(e => e.NoiDungAi).HasColumnName("NoiDungAI");
            entity.Property(e => e.ThoiGian)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.LichSuChatAis)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK__LichSuCha__MaNgu__3E1D39E1");
        });

        modelBuilder.Entity<LichSuHoanTien>(entity =>
        {
            entity.HasKey(e => e.MaLichSu);

            entity.ToTable("LichSuHoanTien");

            entity.Property(e => e.SoTienHoan).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MaGiaoDichHoan).HasMaxLength(200);
            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.HoTenNguoiXuLy).HasMaxLength(100);
            entity.Property(e => e.NgayXuLy)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MaDonHangNavigation).WithMany()
                .HasForeignKey(d => d.MaDonHang)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MaNguoiXuLyNavigation).WithMany()
                .HasForeignKey(d => d.MaNguoiXuLy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LichSuTonKho>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuTo__C443222AAD287400");

            entity.ToTable("LichSuTonKho");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.LoaiThayDoi).HasMaxLength(50);
            entity.Property(e => e.NgayGhiNhan)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoLuongSau).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.SoLuongThayDoi).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.SoLuongTruoc).HasColumnType("decimal(18, 3)");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.LichSuTonKhos)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichSuTon__MaNgu__6B24EA82");

            entity.HasOne(d => d.NguoiThucHienNavigation).WithMany(p => p.LichSuTonKhos)
                .HasForeignKey(d => d.NguoiThucHien)
                .HasConstraintName("FK__LichSuTon__Nguoi__6C190EBB");
        });

        modelBuilder.Entity<Lo>(entity =>
        {
            entity.HasKey(e => e.MaLo).HasName("PK__Lo__272F6C9B3F6B7E8C");

            entity.ToTable("Lo");

            entity.Property(e => e.DonGia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoLuongCon).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(20)
                .HasDefaultValue("ConHang");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.Los)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Lo__MaNguyenLieu__7D966B3E");
        });

        modelBuilder.Entity<MaGiamGia>(entity =>
        {
            entity.HasKey(e => e.MaVoucher).HasName("PK__MaGiamGi__0AAC5B11EA9AD036");

            entity.HasIndex(e => e.MaCode, "UQ__MaGiamGi__152C7C5C565E6B72").IsUnique();

            entity.Property(e => e.DieuKienToiThieu).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiaTri).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiamToiDa).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.LoaiGiam).HasMaxLength(20);
            entity.Property(e => e.MaCode).HasMaxLength(50);
            entity.Property(e => e.NgayBatDau).HasColumnType("datetime");
            entity.Property(e => e.NgayKetThuc).HasColumnType("datetime");
            entity.Property(e => e.TenVoucher).HasMaxLength(200);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
            entity.Property(e => e.GioiHanMotEmail).HasDefaultValue(false);
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D762549B4D72");

            entity.ToTable("NguoiDung");

            entity.HasIndex(e => e.Email, "UQ__NguoiDun__A9D105348E2DD461").IsUnique();

            entity.Property(e => e.AnhDaiDien).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.HoTen).HasMaxLength(150);
            entity.Property(e => e.MatKhau).HasMaxLength(255);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SoDienThoai).HasMaxLength(15);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);

            entity.HasOne(d => d.MaVaiTroNavigation).WithMany(p => p.NguoiDungs)
                .HasForeignKey(d => d.MaVaiTro)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NguoiDung__MaVai__4316F928");
        });

        modelBuilder.Entity<NguyenLieu>(entity =>
        {
            entity.HasKey(e => e.MaNguyenLieu).HasName("PK__NguyenLi__C7519355AE1E9493");

            entity.ToTable("NguyenLieu");

            entity.Property(e => e.DonVi).HasMaxLength(50);
            entity.Property(e => e.GiaNhap).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MoTa).HasMaxLength(500);
            entity.Property(e => e.MucTonToiThieu).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.SoLuongTon).HasColumnType("decimal(18, 3)");
            entity.Property(e => e.TenNguyenLieu).HasMaxLength(200);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<NguyenLieuNcc>(entity =>
        {
            entity.HasKey(e => new { e.MaNguyenLieu, e.MaNhaCungCap }).HasName("PK__NguyenLi__826C3A75CDB75CB7");

            entity.ToTable("NguyenLieu_NCC");

            entity.Property(e => e.GiaCungCap).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.MaNguyenLieuNavigation).WithMany(p => p.NguyenLieuNccs)
                .HasForeignKey(d => d.MaNguyenLieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NguyenLie__MaNgu__123EB7A3");

            entity.HasOne(d => d.MaNhaCungCapNavigation).WithMany(p => p.NguyenLieuNccs)
                .HasForeignKey(d => d.MaNhaCungCap)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NguyenLie__MaNha__1332DBDC");
        });

        modelBuilder.Entity<NhaCungCap>(entity =>
        {
            entity.HasKey(e => e.MaNhaCungCap).HasName("PK__NhaCungC__53DA92050A347E88");

            entity.ToTable("NhaCungCap");

            entity.Property(e => e.DiaChi).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.MaSoThue).HasMaxLength(50);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NguoiLienHe).HasMaxLength(150);
            entity.Property(e => e.SoDienThoai).HasMaxLength(15);
            entity.Property(e => e.TenNhaCungCap).HasMaxLength(200);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<PhieuNhapKho>(entity =>
        {
            entity.HasKey(e => e.MaPhieuNhap).HasName("PK__PhieuNha__1470EF3B2F33770D");

            entity.ToTable("PhieuNhapKho");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.NgayNhap)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoDaTra)
                .HasColumnType("decimal(18, 2)")
                .HasDefaultValue(0m);
            entity.Property(e => e.TrangThaiThanhToan)
                .HasMaxLength(20)
                .HasDefaultValue("ChuaTra");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChoXacNhan");

            entity.HasOne(d => d.MaNguoiTaoNavigation).WithMany(p => p.PhieuNhapKhos)
                .HasForeignKey(d => d.MaNguoiTao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PhieuNhap__MaNgu__71D1E811");

            entity.HasOne(d => d.MaNhaCungCapNavigation).WithMany(p => p.PhieuNhapKhos)
                .HasForeignKey(d => d.MaNhaCungCap)
                .HasConstraintName("FK__PhieuNhap__MaNha__02FC7413");
        });

        modelBuilder.Entity<PhieuXuatKho>(entity =>
        {
            entity.HasKey(e => e.MaPhieuXuat).HasName("PK__PhieuXua__26C4B5A2339A8E75");

            entity.ToTable("PhieuXuatKho");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.LyDoXuat).HasMaxLength(255);
            entity.Property(e => e.NgayXuat)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChoXacNhan");

            entity.HasOne(d => d.MaNguoiTaoNavigation).WithMany(p => p.PhieuXuatKhos)
                .HasForeignKey(d => d.MaNguoiTao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PhieuXuat__MaNgu__7A672E12");
        });

        modelBuilder.Entity<Quyen>(entity =>
        {
            entity.HasKey(e => e.MaQuyen).HasName("PK__Quyen__1D4B7ED4F0FCF2BD");

            entity.ToTable("Quyen");

            entity.Property(e => e.MoTa).HasMaxLength(255);
            entity.Property(e => e.Module).HasMaxLength(100);
            entity.Property(e => e.TenQuyen).HasMaxLength(100);
        });

        modelBuilder.Entity<DanhGiaSanPham>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia);

            entity.ToTable("DanhGiaSanPham");

            entity.HasIndex(e => new { e.MaSanPham, e.MaNguoiDung })
                .IsUnique()
                .HasFilter("[MaNguoiDung] IS NOT NULL");

            entity.Property(e => e.HoTenKhach).HasMaxLength(100);
            entity.Property(e => e.NoiDung).HasMaxLength(1000);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TrangThai).HasDefaultValue(true);

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.DanhGiaSanPhams)
                .HasForeignKey(d => d.MaSanPham)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.DanhGiaSanPhams)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);
        });

        modelBuilder.Entity<ComboChiTiet>(entity =>
        {
            entity.HasKey(e => new { e.MaCombo, e.MaSanPhamCon });

            entity.ToTable("ComboChiTiet");

            entity.Property(e => e.SoLuong).HasDefaultValue(1);

            entity.HasOne(d => d.MaComboNavigation).WithMany(p => p.ComboChiTiets)
                .HasForeignKey(d => d.MaCombo)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MaSanPhamConNavigation).WithMany(p => p.ComboThanhPhanCua)
                .HasForeignKey(d => d.MaSanPhamCon)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<SanPham>(entity =>
        {
            entity.HasKey(e => e.MaSanPham).HasName("PK__SanPham__FAC7442D3EEBF84C");

            entity.ToTable("SanPham");

            entity.Property(e => e.DonVi)
                .HasMaxLength(50)
                .HasDefaultValue("Ly");
            entity.Property(e => e.GiaBan).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiaGoc).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MoTa).HasMaxLength(1000);
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TenSanPham).HasMaxLength(200);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);

            entity.HasOne(d => d.MaDanhMucNavigation).WithMany(p => p.SanPhams)
                .HasForeignKey(d => d.MaDanhMuc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SanPham__MaDanhM__5165187F");
        });

        modelBuilder.Entity<SanPhamTopping>(entity =>
        {
            entity.HasKey(e => new { e.MaSanPham, e.MaTopping }).HasName("PK__SanPham___F9FB6BEBB370F386");

            entity.ToTable("SanPham_Topping");

            entity.Property(e => e.GiaThem).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.SanPhamToppings)
                .HasForeignKey(d => d.MaSanPham)
                .HasConstraintName("FK__SanPham_T__MaSan__5DCAEF64");

            entity.HasOne(d => d.MaToppingNavigation).WithMany(p => p.SanPhamToppings)
                .HasForeignKey(d => d.MaTopping)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SanPham_T__MaTop__5EBF139D");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaThanhToan).HasName("PK__ThanhToa__D4B25844F58BED61");

            entity.ToTable("ThanhToan");

            entity.Property(e => e.GhiChu).HasMaxLength(500);
            entity.Property(e => e.MaGiaoDich).HasMaxLength(200);
            entity.Property(e => e.PhuongThucThanhToan).HasMaxLength(50);
            entity.Property(e => e.SoTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ThoiGianThanhToan)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("ChoDuyet");

            entity.HasOne(d => d.MaHoaDonNavigation).WithMany(p => p.ThanhToans)
                .HasForeignKey(d => d.MaHoaDon)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThanhToan__MaHoa__3493CFA7");
        });

        modelBuilder.Entity<Topping>(entity =>
        {
            entity.HasKey(e => e.MaTopping).HasName("PK__Topping__33C2FC615D2FC689");

            entity.ToTable("Topping");

            entity.Property(e => e.Gia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TenTopping).HasMaxLength(150);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<TinTuc>(entity =>
        {
            entity.HasKey(e => e.MaTinTuc);

            entity.ToTable("TinTuc");

            entity.Property(e => e.TieuDe).HasMaxLength(250);
            entity.Property(e => e.DanhMuc).HasMaxLength(100);
            entity.Property(e => e.TomTat).HasMaxLength(500);
            entity.Property(e => e.AnhDaiDien).HasMaxLength(500);
            entity.Property(e => e.AnhPhu).HasColumnType("nvarchar(max)");
            entity.Property(e => e.TrangThai).HasMaxLength(20);
            entity.Property(e => e.NgayDang).HasColumnType("datetime");
            entity.Property(e => e.NgayTao).HasColumnType("datetime");
            entity.Property(e => e.NgayCapNhat).HasColumnType("datetime");
        });

        modelBuilder.Entity<VaiTro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PK__VaiTro__C24C41CFFDB03D2B");

            entity.ToTable("VaiTro");

            entity.Property(e => e.MoTa).HasMaxLength(255);
            entity.Property(e => e.TenVaiTro).HasMaxLength(100);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);

            entity.HasMany(d => d.MaQuyens).WithMany(p => p.MaVaiTros)
                .UsingEntity<Dictionary<string, object>>(
                    "VaiTroQuyen",
                    r => r.HasOne<Quyen>().WithMany()
                        .HasForeignKey("MaQuyen")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__VaiTro_Qu__MaQuy__3D5E1FD2"),
                    l => l.HasOne<VaiTro>().WithMany()
                        .HasForeignKey("MaVaiTro")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__VaiTro_Qu__MaVai__3C69FB99"),
                    j =>
                    {
                        j.HasKey("MaVaiTro", "MaQuyen").HasName("PK__VaiTro_Q__9398F6221407973D");
                        j.ToTable("VaiTro_Quyen");
                    });
        });

        modelBuilder.Entity<PhanQuyenNguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaPhanQuyen).HasName("PK__PhanQuyenNguoiDung__MaPhanQuyen");

            entity.ToTable("PhanQuyenNguoiDung");

            entity.Property(e => e.Tat).HasDefaultValue(false);

            entity.HasOne(d => d.MaNguoiDungNavigation)
                .WithMany(p => p.PhanQuyenNguoiDungs)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MaQuyenNavigation)
                .WithMany(p => p.PhanQuyenNguoiDungs)
                .HasForeignKey(d => d.MaQuyen)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Size>(entity =>
        {
            entity.HasKey(e => e.MaSize).HasName("PK__Size__A20E0F7E8B9A1234");

            entity.ToTable("Size");

            entity.Property(e => e.TenSize).HasMaxLength(10).IsRequired();
            entity.Property(e => e.HeSoGia).HasColumnType("decimal(3, 2)");
        });

        modelBuilder.Entity<GiaSanPhamTheoSize>(entity =>
        {
            entity.HasKey(e => e.MaGia).HasName("PK__GiaSanPh__A20E0F7E8B9A1235");

            entity.ToTable("GiaSanPhamTheoSize");

            entity.Property(e => e.Gia).HasColumnType("decimal(18, 2)");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
