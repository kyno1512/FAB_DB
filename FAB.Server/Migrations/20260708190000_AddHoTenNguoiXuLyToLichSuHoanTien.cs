using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FAB.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddHoTenNguoiXuLyToLichSuHoanTien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HoTenNguoiXuLy",
                table: "LichSuHoanTien",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HoTenNguoiXuLy",
                table: "LichSuHoanTien");
        }
    }
}
