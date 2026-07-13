using AutoMapper;
using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Models;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<NguoiDung, LoginResponse>()
            .ForMember(dest => dest.TenVaiTro, opt => opt.MapFrom(src =>
                src.MaVaiTroNavigation != null ? src.MaVaiTroNavigation.TenVaiTro : string.Empty))
            .ForMember(dest => dest.Token, opt => opt.Ignore());

        CreateMap<RegisterRequest, NguoiDung>()
            .ForMember(dest => dest.MaNguoiDung, opt => opt.Ignore())
            .ForMember(dest => dest.MaVaiTro, opt => opt.Ignore())
            .ForMember(dest => dest.HoTen, opt => opt.MapFrom(src => src.HoTen.Trim()))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => StringNormalizer.NormalizeEmail(src.Email)))
            .ForMember(dest => dest.SoDienThoai, opt => opt.MapFrom(src => src.SoDienThoai.Trim()))
            .ForMember(dest => dest.MatKhau, opt => opt.MapFrom(src => src.Password.Trim()))
            .ForMember(dest => dest.AnhDaiDien, opt => opt.Ignore())
            .ForMember(dest => dest.TrangThai, opt => opt.MapFrom(_ => true))
            .ForMember(dest => dest.NgayTao, opt => opt.MapFrom(_ => DateTime.Now))
            .ForMember(dest => dest.MaVaiTroNavigation, opt => opt.Ignore())
            .ForMember(dest => dest.DonDatHangNhaps, opt => opt.Ignore())
            .ForMember(dest => dest.DonHangs, opt => opt.Ignore())
            .ForMember(dest => dest.KhachHangs, opt => opt.Ignore())
            .ForMember(dest => dest.LichSuChatAis, opt => opt.Ignore())
            .ForMember(dest => dest.LichSuTonKhos, opt => opt.Ignore())
            .ForMember(dest => dest.PhieuNhapKhos, opt => opt.Ignore())
            .ForMember(dest => dest.PhieuXuatKhos, opt => opt.Ignore());

        CreateMap<RegisterRequest, KhachHang>()
            .ForMember(dest => dest.MaKhachHang, opt => opt.Ignore())
            .ForMember(dest => dest.MaNguoiDung, opt => opt.Ignore())
            .ForMember(dest => dest.HoTen, opt => opt.MapFrom(src => src.HoTen.Trim()))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => StringNormalizer.NormalizeEmail(src.Email)))
            .ForMember(dest => dest.SoDienThoai, opt => opt.MapFrom(src => src.SoDienThoai.Trim()))
            .ForMember(dest => dest.DiaChi, opt => opt.MapFrom(src => StringNormalizer.TrimOrNull(src.DiaChi)))
            .ForMember(dest => dest.NgaySinh, opt => opt.Ignore())
            .ForMember(dest => dest.DiemTichLuy, opt => opt.Ignore())
            .ForMember(dest => dest.NgayTao, opt => opt.Ignore())
            .ForMember(dest => dest.MaNguoiDungNavigation, opt => opt.Ignore())
            .ForMember(dest => dest.DonHangs, opt => opt.Ignore());

        // ── Product: Nhập = AutoMapper (form Request → Entity) ──

        CreateMap<DanhMucRequest, DanhMuc>()
            .ForMember(dest => dest.MaDanhMuc, opt => opt.Ignore())
            .ForMember(dest => dest.TenDanhMuc, opt => opt.MapFrom(src => src.TenDanhMuc.Trim()))
            .ForMember(dest => dest.MoTa, opt => opt.MapFrom(src => StringNormalizer.TrimOrNull(src.MoTa)))
            .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => StringNormalizer.TrimOrNull(src.HinhAnh)))
            .ForMember(dest => dest.SanPhams, opt => opt.Ignore());

        CreateMap<SanPhamCreateRequest, SanPham>()
            .ForMember(dest => dest.MaSanPham, opt => opt.Ignore())
            .ForMember(dest => dest.TenSanPham, opt => opt.MapFrom(src => src.TenSanPham.Trim()))
            .ForMember(dest => dest.MoTa, opt => opt.MapFrom(src => StringNormalizer.TrimOrNull(src.MoTa)))
            .ForMember(dest => dest.DonVi, opt => opt.MapFrom(src => StringNormalizer.TrimOrNull(src.DonVi) ?? "Ly"))
            .ForMember(dest => dest.NgayTao, opt => opt.MapFrom(_ => DateTime.Now))
            .ForMember(dest => dest.MaDanhMucNavigation, opt => opt.Ignore())
            .ForMember(dest => dest.HinhAnhSanPhams, opt => opt.Ignore())
            .ForMember(dest => dest.SanPhamToppings, opt => opt.Ignore())
            .ForMember(dest => dest.ComboChiTiets, opt => opt.Ignore())
            .ForMember(dest => dest.ComboThanhPhanCua, opt => opt.Ignore())
            .ForMember(dest => dest.ChiTietDonHangs, opt => opt.Ignore())
            .ForMember(dest => dest.CongThucSanPhams, opt => opt.Ignore());

        // Update kế thừa CreateRequest → IncludeBase tái dùng map Create, chỉ khác không ghi đè NgayTao
        CreateMap<SanPhamUpdateRequest, SanPham>()
            .IncludeBase<SanPhamCreateRequest, SanPham>()
            .ForMember(dest => dest.NgayTao, opt => opt.Ignore());
    }
}