using System.Text;

namespace FAB.Server.Services.Chat;

public static class ChatFallbackService
{
    public static string BuildReply(string message, IReadOnlyList<ProductSnippet> products)
    {
        var q = message.ToLowerInvariant();

        if (q.Contains("cod") || q.Contains("thanh toán") || q.Contains("thanh toan"))
        {
            return "COD là thanh toán khi nhận hàng — bạn chọn COD ở bước thanh toán, shipper giao tới rồi mới trả tiền mặt. Muốn trả online thì chọn VNPay (thẻ/QR).";
        }

        if (q.Contains("vnpay") || q.Contains("thẻ") || q.Contains("the "))
        {
            return "VNPay cho phép thanh toán online bằng thẻ/QR ngay trên web. Chọn VNPay ở bước thanh toán, làm theo hướng dẫn là xong.";
        }

        if (ContainsAny(q, "mấy năm", "may nam", "hoạt động", "hoat dong", "thành lập", "thanh lap", "bao lâu rồi", "bao lau roi", "lâu đời", "lau doi"))
        {
            return "Flygo Bakery bắt đầu từ năm 2020 — đến nay đã hơn 5 năm phục vụ bánh tươi và cà phê specialty. Bạn muốn thử món đặc trưng nào không?";
        }

        if (ContainsAny(q, "mở cửa", "mo cua", "giờ", "gio ", "đóng cửa", "dong cua", "địa chỉ", "dia chi", "ở đâu", "o dau"))
        {
            return "Flygo mở cửa 7:00–22:00 hàng ngày. Bạn đặt online trên website là giao tận nơi — không cần ra quán cũng được nhé!";
        }

        if (ContainsAny(q, "giao", "ship", "mấy phút", "may phut", "delivery") ||
            (ContainsAny(q, "bao lâu", "bao lau") && !ContainsAny(q, "rồi", "roi", "năm", "nam")))
        {
            return "Flygo giao trong khu vực nội thành thường khoảng 30–60 phút tùy địa chỉ và giờ đông khách. Bạn đặt hàng xong sẽ thấy trạng thái đơn trên website nhé!";
        }

        if (ContainsAny(q, "ngon nhất", "ngon nhat", "best", "nổi bật", "noi bat", "đặc sản", "dac san", "nên thử", "nen thu", "khuyên", "gợi ý món", "goi y mon"))
        {
            return BuildBestPick(products);
        }

        if (q.Contains("combo") || (ContainsAny(q, "gợi ý", "goi y") && ContainsAny(q, "bánh", "banh", "cà phê", "ca phe")))
        {
            return BuildComboSuggestion(products);
        }

        if (ContainsAny(q, "rẻ", "re nhat", "rẻ nhất", "gia re", "giá rẻ"))
        {
            return BuildCheapestPick(products);
        }

        if (ContainsAny(q, "nước", "nuoc", "uống", "uong", "drink", "cà phê", "ca phe", "coffee", "trà", "tra "))
        {
            if (WantsToBuy(q))
                return BuildBuyCategoryReply(products, isDrink: true);

            return BuildCategoryList(products, isDrink: true);
        }

        if (ContainsAny(q, "bánh", "banh", "bakery", "ngọt", "ngot", "tiramisu", "croissant"))
        {
            if (WantsToBuy(q))
                return BuildBuyCategoryReply(products, isDrink: false);

            return BuildCategoryList(products, isDrink: false);
        }

        if (q.Contains("sản phẩm") || q.Contains("san pham") || q.Contains("menu") || q.Contains("có gì") || q.Contains("co gi"))
        {
            return BuildProductList(products);
        }

        if (q is "hi" or "hello" or "xin chào" or "xin chao" or "chào" or "chao")
        {
            return "Chào bạn! Mình là Flygo AI. Hỏi mình về món ngon, combo bánh/cà phê, giá, giao hàng hay cách đặt hàng nhé!";
        }

        var matched = FindProductInQuestion(q, products);
        if (matched is not null)
            return DescribeProduct(matched);

        if (WantsToBuy(q))
            return BuildGeneralBuyGuide(products);

        return "Mình chưa hiểu rõ câu hỏi. Bạn có thể hỏi về món ngon, combo, giá, giao hàng, COD/VNPay hoặc cách đặt hàng nhé!";
    }

    private static bool WantsToBuy(string q) =>
        ContainsAny(q, "mua", "đặt", "dat", "order", "lấy", "lay", "cần", "can ");

    private static bool ContainsAny(string text, params string[] terms) =>
        terms.Any(text.Contains);

    private static bool IsDrink(ProductSnippet p)
    {
        var n = p.TenSanPham;
        return n.Contains("cà phê", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("ca phe", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("cappuccino", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("latte", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("espresso", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("brew", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("trà", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("tra ", StringComparison.OrdinalIgnoreCase) ||
               n.Contains("nước", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsBakery(ProductSnippet p) => !IsDrink(p);

    private static ProductSnippet? FindProductInQuestion(string q, IReadOnlyList<ProductSnippet> products)
    {
        foreach (var p in products.OrderByDescending(x => x.TenSanPham.Length))
        {
            var name = p.TenSanPham.ToLowerInvariant();
            if (q.Contains(name))
                return p;

            foreach (var word in name.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                if (word.Length >= 4 && q.Contains(word))
                    return p;
            }
        }

        return null;
    }

    private static string DescribeProduct(ProductSnippet p)
    {
        var detail = string.IsNullOrWhiteSpace(p.MoTa) ? "Món đang bán tại Flygo." : p.MoTa.Trim();
        return $"{p.TenSanPham} — {p.GiaBan:N0}đ. {detail} Vào trang Sản phẩm → bấm Thêm vào giỏ để đặt nhé!";
    }

    private static string BuildBuyCategoryReply(IReadOnlyList<ProductSnippet> products, bool isDrink)
    {
        var items = products.Where(p => isDrink ? IsDrink(p) : IsBakery(p)).ToList();
        if (items.Count == 0)
        {
            return isDrink
                ? "Flygo chưa cập nhật đồ uống. Bạn xem trang Sản phẩm nhé!"
                : "Flygo chưa cập nhật bánh. Bạn xem trang Sản phẩm nhé!";
        }

        var pick = items.FirstOrDefault(p => p.TenSanPham.Contains("latte", StringComparison.OrdinalIgnoreCase))
            ?? items.FirstOrDefault(p => p.TenSanPham.Contains("tiramisu", StringComparison.OrdinalIgnoreCase))
            ?? items.OrderByDescending(p => p.GiaBan).First();

        var label = isDrink ? "đồ uống" : "bánh";
        var others = items
            .Where(p => p.TenSanPham != pick.TenSanPham)
            .Take(3)
            .Select(p => $"{p.TenSanPham} ({p.GiaBan:N0}đ)")
            .ToList();

        var sb = new StringBuilder();
        sb.Append($"Để mua {label}, gợi ý {pick.TenSanPham} ({pick.GiaBan:N0}đ). ");
        if (others.Count > 0)
            sb.Append($"Hoặc chọn {string.Join(", ", others)}. ");
        sb.Append("Vào Sản phẩm → Thêm vào giỏ → Giỏ hàng → Thanh toán → chọn COD hoặc VNPay.");
        return sb.ToString();
    }

    private static string BuildCategoryList(IReadOnlyList<ProductSnippet> products, bool isDrink)
    {
        var items = products.Where(p => isDrink ? IsDrink(p) : IsBakery(p)).Take(6).ToList();
        if (items.Count == 0)
            return "Chưa có món trong danh mục này. Bạn xem trang Sản phẩm nhé!";

        var label = isDrink ? "đồ uống" : "bánh";
        var sb = new StringBuilder($"Flygo có các {label}:\n");
        foreach (var p in items)
            sb.AppendLine($"• {p.TenSanPham} — {p.GiaBan:N0}đ");
        sb.Append("\nMuốn đặt món nào cứ nói tên, mình hướng dẫn thêm vào giỏ nhé!");
        return sb.ToString().Trim();
    }

    private static string BuildGeneralBuyGuide(IReadOnlyList<ProductSnippet> products)
    {
        if (products.Count == 0)
            return "Vào trang Sản phẩm → chọn món → Thêm vào giỏ → Thanh toán.";

        var drinks = products.Where(IsDrink).Take(2).Select(p => p.TenSanPham).ToList();
        var bakeries = products.Where(IsBakery).Take(2).Select(p => p.TenSanPham).ToList();

        var hint = new StringBuilder("Bạn muốn mua gì? ");
        if (drinks.Count > 0)
            hint.Append($"Đồ uống: {string.Join(", ", drinks)}. ");
        if (bakeries.Count > 0)
            hint.Append($"Bánh: {string.Join(", ", bakeries)}. ");
        hint.Append("Chọn món trên trang Sản phẩm → Thêm vào giỏ → Thanh toán.");
        return hint.ToString();
    }

    private static string BuildBestPick(IReadOnlyList<ProductSnippet> products)
    {
        if (products.Count == 0)
            return "Flygo đang cập nhật menu. Bạn vào trang Sản phẩm để xem bánh và cà phê nhé!";

        var pick = products.FirstOrDefault(p =>
            p.TenSanPham.Contains("tiramisu", StringComparison.OrdinalIgnoreCase))
            ?? products.OrderByDescending(p => p.GiaBan).First();

        var reason = string.IsNullOrWhiteSpace(pick.MoTa)
            ? "Đây là món được nhiều khách Flygo chọn và đánh giá cao."
            : pick.MoTa.Trim();

        var alt = products
            .Where(p => !string.Equals(p.TenSanPham, pick.TenSanPham, StringComparison.OrdinalIgnoreCase))
            .Take(2)
            .Select(p => p.TenSanPham)
            .ToList();

        var altText = alt.Count > 0
            ? $" Bạn cũng có thể thử thêm {string.Join(" hoặc ", alt)}."
            : string.Empty;

        return $"Món gợi ý nhất tại Flygo là {pick.TenSanPham} ({pick.GiaBan:N0}đ). {reason}{altText}";
    }

    private static string BuildCheapestPick(IReadOnlyList<ProductSnippet> products)
    {
        if (products.Count == 0)
            return "Chưa có sản phẩm trong hệ thống.";

        var pick = products.OrderBy(p => p.GiaBan).First();
        return $"Món giá mềm nhất hiện tại: {pick.TenSanPham} — {pick.GiaBan:N0}đ. Rất hợp để thử lần đầu!";
    }

    private static string BuildComboSuggestion(IReadOnlyList<ProductSnippet> products)
    {
        if (products.Count == 0)
            return "Flygo đang cập nhật menu. Bạn vào trang Sản phẩm để xem bánh và cà phê nhé!";

        var bakery = products.FirstOrDefault(p => IsBakery(p) &&
            (p.TenSanPham.Contains("tiramisu", StringComparison.OrdinalIgnoreCase) ||
             p.TenSanPham.Contains("sừng", StringComparison.OrdinalIgnoreCase) ||
             p.TenSanPham.Contains("croissant", StringComparison.OrdinalIgnoreCase)));

        var drink = products.FirstOrDefault(IsDrink);

        bakery ??= products.FirstOrDefault(IsBakery) ?? products[0];
        drink ??= products.FirstOrDefault(IsDrink) ?? products[Math.Min(1, products.Count - 1)];

        var total = bakery.GiaBan + drink.GiaBan;
        return $"Gợi ý combo hôm nay: {bakery.TenSanPham} ({bakery.GiaBan:N0}đ) + {drink.TenSanPham} ({drink.GiaBan:N0}đ) ≈ {total:N0}đ. Thêm vào giỏ từ trang Sản phẩm rồi thanh toán nhé!";
    }

    private static string BuildProductList(IReadOnlyList<ProductSnippet> products)
    {
        if (products.Count == 0)
            return "Chưa có sản phẩm trong hệ thống. Bạn xem trang Sản phẩm trên web nhé!";

        var sb = new StringBuilder("Flygo đang có:\n");
        foreach (var p in products.Take(6))
            sb.AppendLine($"• {p.TenSanPham} — {p.GiaBan:N0}đ");
        return sb.ToString().Trim();
    }
}

public record ProductSnippet(string TenSanPham, decimal GiaBan, string? MoTa);
