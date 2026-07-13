using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FAB.Server.Migrations
{
    public partial class AddNguyenLieuHanSuDung : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly?>(
                name: "HanSuDungTu",
                table: "NguyenLieu",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly?>(
                name: "HanSuDungDen",
                table: "NguyenLieu",
                type: "date",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HanSuDungTu",
                table: "NguyenLieu");

            migrationBuilder.DropColumn(
                name: "HanSuDungDen",
                table: "NguyenLieu");
        }
    }
}
