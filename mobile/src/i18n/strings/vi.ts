// Vietnamese (Tiếng Việt) — machine-drafted; unreviewed until a native speaker verifies.
import { Strings } from "./en";

export const vi: Strings = {
  meta: { nativeName: "Tiếng Việt", rtl: false, reviewed: false },

  app: {
    tagline: "Nhìn thấy. Nhận biết. Giữ an toàn.",
    demoMode: "Chế độ demo — kết quả mẫu để thử nghiệm",
    machineTranslated: "Bản dịch máy — các bước quan trọng chưa được người bản ngữ kiểm chứng",
    language: "Ngôn ngữ",
  },

  home: {
    emergencyTitle: "Có ai bị rắn cắn không?",
    emergencySub: "Chạm để xem sơ cứu khẩn cấp",
    checkTitle: "Kiểm tra một con rắn",
    hint: "📏 Đứng thật xa và dùng zoom — tuyệt đối không lại gần rắn để chụp ảnh đẹp hơn. Sau khi chụp, hãy cắt sát quanh con rắn để nó chiếm trọn khung hình.",
    dropZone: "Ảnh của bạn sẽ hiện ở đây",
    takePhoto: "📷  Chụp ảnh",
    upload: "Tải lên",
    analyzing: "Đang kiểm tra ảnh…",
  },

  verdict: {
    dangerous: {
      label: "Nguy cơ cao",
      headline: "Hãy coi là NGUY HIỂM — nhiều khả năng có nọc độc",
      subtext: "Đây rất có thể là rắn độc hoặc rắn nguy hiểm. Hãy đứng thật xa và không lại gần.",
    },
    caution: {
      label: "Thận trọng",
      headline: "Nên thận trọng — giữ khoảng cách",
      subtext: "Có một số dấu hiệu nguy hiểm, nhưng chưa xác định chắc chắn có nọc độc. Hãy tránh xa, đừng dồn ép hay chạm vào nó; nếu bị cắn, hãy tìm trợ giúp y tế ngay.",
    },
    lowRisk: {
      label: "Nguy cơ thấp hơn",
      headline: "Có thể không có nọc độc — nhưng vẫn giữ khoảng cách",
      subtext: "Khả năng có nọc độc thấp, nhưng tuyệt đối không cầm nắm hay lại gần bất kỳ con rắn nào. Nếu bị cắn, hãy đi khám ngay lập tức.",
    },
    unidentified: {
      label: "Không nhận diện được",
      headline: "Không xác nhận được là rắn — hãy coi là NGUY HIỂM",
      subtext: "Đây có vẻ không phải ảnh rắn rõ ràng. Hãy chụp lại từ khoảng cách an toàn (dùng zoom, không lại gần). Khi nghi ngờ, hãy tránh xa và coi nó là nguy hiểm.",
    },
  },

  confidence: {
    dangerous: "Faunari ước tính khả năng cao (~{pct}%) đây là rắn độc.",
    caution: "Faunari ước tính khả năng có nọc độc ~{pct}% — chưa chắc chắn, nhưng không đủ thấp để loại trừ rủi ro. Hãy thận trọng.",
    lowRisk: "Faunari ước tính khả năng có nọc độc thấp (~{pct}%) — nhưng đừng bao giờ coi bất kỳ con rắn nào là an toàn.",
    ood: "Faunari không thể xác nhận một con rắn rõ ràng trong ảnh này, nên nó không đoán mò.",
  },

  emergency: {
    headline: "Đi cấp cứu NGAY",
    steps: [
      "Gọi cấp cứu ngay lập tức — bấm {ambulance} để gọi xe cứu thương.",
      "Đến bệnh viện gần nhất có huyết thanh kháng nọc nhanh nhất có thể một cách an toàn.",
      "Giữ người bệnh bình tĩnh và hạn chế cử động tối đa; trấn an họ.",
      "Ghi lại thời điểm bị cắn và các triệu chứng thay đổi để báo cho bác sĩ.",
    ],
  },

  firstAid: {
    titleNow: "Cần làm gì ngay",
    titleIfBitten: "Nếu bị cắn",
    emphasisDanger: "Đi cấp cứu NGAY — gọi {ambulance}.",
    emphasisCaution: "Hãy coi mọi vết rắn cắn là cấp cứu — đi khám ngay lập tức ({ambulance}).",
    doLabel: "NÊN",
    dontLabel: "KHÔNG NÊN",
    do: [
      "Đưa mọi người tránh xa con rắn đến khoảng cách an toàn.",
      "Giữ người bị cắn bình tĩnh và bất động — cử động làm nọc độc lan nhanh hơn.",
      "Giữ chi bị cắn bất động, để ngang mức tim; tháo nhẫn, đồng hồ, nới quần áo chật.",
      "Đến ngay bệnh viện có huyết thanh kháng nọc; gọi {ambulance}.",
    ],
    dont: [
      "KHÔNG rạch, hút hay cố nặn nọc ra khỏi vết thương.",
      "KHÔNG buộc garô hay băng ép chặt.",
      "KHÔNG chườm đá; không cho uống rượu, ăn uống hay dùng thuốc an thần.",
      "KHÔNG cố bắt hay giết con rắn — một bức ảnh rõ từ khoảng cách an toàn là đủ.",
      "KHÔNG mất thời gian với các mẹo dân gian.",
    ],
    goodToKnow: "Nên biết",
    lowRiskNote: "Ngay cả rắn ít nguy hiểm cũng có thể cắn. Đừng cầm nắm, dồn ép hay lại gần. Hãy nhường chỗ để nó tự bỏ đi.",
    whatToDo: "Cần làm gì",
    oodAdvice: "📷 Chụp lại từ khoảng cách an toàn — dùng zoom, không lại gần. Nếu có người bị cắn, dùng bảng khẩn cấp phía trên.",
  },

  feedback: {
    ask: "Kết quả này có hữu ích không?",
    yes: "👍  Có vẻ đúng",
    no: "👎  Chưa đúng lắm",
    disputeQ: "Thực ra nó là gì?",
    harmless: "Thực ra nó vô hại",
    dangerous: "Thực ra nó nguy hiểm",
    notASnake: "Đó không phải là rắn",
    thanks: "🙏 Cảm ơn — phản hồi của bạn giúp Faunari tốt hơn.",
  },

  disclaimer:
    "Faunari là nguyên mẫu giáo dục, KHÔNG phải thiết bị y tế. Nó có thể sai (có thể bỏ sót rắn nguy hiểm). Đừng bao giờ dựa vào nó cho các quyết định y tế hay an toàn.",
};
