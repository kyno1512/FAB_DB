using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FAB.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddLichSuHoanTien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HanSuDung",
                table: "ChiTietPhieuNhapKho");

            migrationBuilder.DropColumn(
                name: "HanSuDungDen",
                table: "ChiTietPhieuNhapKho");

            migrationBuilder.AlterColumn<string>(
                name: "TrangThaiHuy",
                table: "DonHang",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NguoiXuLyHoan",
                table: "DonHang",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MaGiaoDichHoan",
                table: "DonHang",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CoSize",
                table: "DanhMuc",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DonGia",
                table: "ChiTietPhieuXuatKho",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaLo",
                table: "ChiTietPhieuXuatKho",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaLo",
                table: "ChiTietPhieuNhapKho",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaSize",
                table: "ChiTietGioHang",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Lo",
                columns: table => new
                {
                    MaLo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguyenLieu = table.Column<int>(type: "int", nullable: false),
                    NgaySanXuat = table.Column<DateOnly>(type: "date", nullable: true),
                    HanSuDung = table.Column<DateOnly>(type: "date", nullable: false),
                    SoLuong = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoLuongCon = table.Column<decimal>(type: "decimal(18,3)", nullable: false),
                    DonGia = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "ConHang")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Lo__272F6C9B3F6B7E8C", x => x.MaLo);
                    table.ForeignKey(
                        name: "FK__Lo__MaNguyenLieu__7D966B3E",
                        column: x => x.MaNguyenLieu,
                        principalTable: "NguyenLieu",
                        principalColumn: "MaNguyenLieu",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhanQuyenNguoiDung",
                columns: table => new
                {
                    MaPhanQuyen = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaQuyen = table.Column<int>(type: "int", nullable: false),
                    Tat = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PhanQuyenNguoiDung__MaPhanQuyen", x => x.MaPhanQuyen);
                    table.ForeignKey(
                        name: "FK_PhanQuyenNguoiDung_NguoiDung_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDung",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhanQuyenNguoiDung_Quyen_MaQuyen",
                        column: x => x.MaQuyen,
                        principalTable: "Quyen",
                        principalColumn: "MaQuyen",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Size",
                columns: table => new
                {
                    MaSize = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenSize = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    HeSoGia = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Size__A20E0F7E8B9A1234", x => x.MaSize);
                });

            migrationBuilder.CreateTable(
                name: "GiaSanPhamTheoSize",
                columns: table => new
                {
                    MaGia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaSanPham = table.Column<int>(type: "int", nullable: false),
                    MaSize = table.Column<int>(type: "int", nullable: false),
                    Gia = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GiaSanPh__A20E0F7E8B9A1235", x => x.MaGia);
                    table.ForeignKey(
                        name: "FK_GiaSanPhamTheoSize_SanPham_MaSanPham",
                        column: x => x.MaSanPham,
                        principalTable: "SanPham",
                        principalColumn: "MaSanPham",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GiaSanPhamTheoSize_Size_MaSize",
                        column: x => x.MaSize,
                        principalTable: "Size",
                        principalColumn: "MaSize",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietPhieuXuatKho_MaLo",
                table: "ChiTietPhieuXuatKho",
                column: "MaLo");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietPhieuNhapKho_MaLo",
                table: "ChiTietPhieuNhapKho",
                column: "MaLo");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietGioHang_MaSize",
                table: "ChiTietGioHang",
                column: "MaSize");

            migrationBuilder.CreateIndex(
                name: "IX_GiaSanPhamTheoSize_MaSanPham",
                table: "GiaSanPhamTheoSize",
                column: "MaSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_GiaSanPhamTheoSize_MaSize",
                table: "GiaSanPhamTheoSize",
                column: "MaSize");

            migrationBuilder.CreateIndex(
                name: "IX_Lo_MaNguyenLieu",
                table: "Lo",
                column: "MaNguyenLieu");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyenNguoiDung_MaNguoiDung",
                table: "PhanQuyenNguoiDung",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyenNguoiDung_MaQuyen",
                table: "PhanQuyenNguoiDung",
                column: "MaQuyen");

            migrationBuilder.AddForeignKey(
                name: "FK__ChiTietGioHang__MaSize",
                table: "ChiTietGioHang",
                column: "MaSize",
                principalTable: "Size",
                principalColumn: "MaSize");

            migrationBuilder.AddForeignKey(
                name: "FK__ChiTietPh__MaLo__7E4B8F4A",
                table: "ChiTietPhieuNhapKho",
                column: "MaLo",
                principalTable: "Lo",
                principalColumn: "MaLo");

            migrationBuilder.AddForeignKey(
                name: "FK__ChiTietPh__MaLo__7F3B9F83",
                table: "ChiTietPhieuXuatKho",
                column: "MaLo",
                principalTable: "Lo",
                principalColumn: "MaLo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__ChiTietGioHang__MaSize",
                table: "ChiTietGioHang");

            migrationBuilder.DropForeignKey(
                name: "FK__ChiTietPh__MaLo__7E4B8F4A",
                table: "ChiTietPhieuNhapKho");

            migrationBuilder.DropForeignKey(
                name: "FK__ChiTietPh__MaLo__7F3B9F83",
                table: "ChiTietPhieuXuatKho");

            migrationBuilder.DropTable(
                name: "GiaSanPhamTheoSize");

            migrationBuilder.DropTable(
                name: "Lo");

            migrationBuilder.DropTable(
                name: "PhanQuyenNguoiDung");

            migrationBuilder.DropTable(
                name: "Size");

            migrationBuilder.DropIndex(
                name: "IX_ChiTietPhieuXuatKho_MaLo",
                table: "ChiTietPhieuXuatKho");

            migrationBuilder.DropIndex(
                name: "IX_ChiTietPhieuNhapKho_MaLo",
                table: "ChiTietPhieuNhapKho");

            migrationBuilder.DropIndex(
                name: "IX_ChiTietGioHang_MaSize",
                table: "ChiTietGioHang");

            migrationBuilder.DropColumn(
                name: "CoSize",
                table: "DanhMuc");

            migrationBuilder.DropColumn(
                name: "DonGia",
                table: "ChiTietPhieuXuatKho");

            migrationBuilder.DropColumn(
                name: "MaLo",
                table: "ChiTietPhieuXuatKho");

            migrationBuilder.DropColumn(
                name: "MaLo",
                table: "ChiTietPhieuNhapKho");

            migrationBuilder.DropColumn(
                name: "MaSize",
                table: "ChiTietGioHang");

            migrationBuilder.AlterColumn<string>(
                name: "TrangThaiHuy",
                table: "DonHang",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NguoiXuLyHoan",
                table: "DonHang",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MaGiaoDichHoan",
                table: "DonHang",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "HanSuDung",
                table: "ChiTietPhieuNhapKho",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "HanSuDungDen",
                table: "ChiTietPhieuNhapKho",
                type: "date",
                nullable: true);
        }
    }
}
