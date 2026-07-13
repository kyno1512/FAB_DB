using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FAB.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRefundFieldsToDonHang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "YeuCauHuy",
                table: "DonHangs",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LyDoHuy",
                table: "DonHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayYeuCauHuy",
                table: "DonHangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiHuy",
                table: "DonHangs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SoTienHoan",
                table: "DonHangs",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayHoanTien",
                table: "DonHangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaGiaoDichHoan",
                table: "DonHangs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NguoiXuLyHoan",
                table: "DonHangs",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "YeuCauHuy", table: "DonHangs");
            migrationBuilder.DropColumn(name: "LyDoHuy", table: "DonHangs");
            migrationBuilder.DropColumn(name: "NgayYeuCauHuy", table: "DonHangs");
            migrationBuilder.DropColumn(name: "TrangThaiHuy", table: "DonHangs");
            migrationBuilder.DropColumn(name: "SoTienHoan", table: "DonHangs");
            migrationBuilder.DropColumn(name: "NgayHoanTien", table: "DonHangs");
            migrationBuilder.DropColumn(name: "MaGiaoDichHoan", table: "DonHangs");
            migrationBuilder.DropColumn(name: "NguoiXuLyHoan", table: "DonHangs");
        }
    }
}
