using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FAB.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailToDonHang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "DonHang",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SoDienThoai",
                table: "DonHang",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "DonHang");

            migrationBuilder.DropColumn(
                name: "SoDienThoai",
                table: "DonHang");
        }
    }
}
