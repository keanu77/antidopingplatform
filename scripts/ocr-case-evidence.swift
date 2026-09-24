import Foundation
import PDFKit
import Vision
import AppKit

guard CommandLine.arguments.count == 3,
      let pdf = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1])) else {
    fputs("usage: ocr input.pdf output.txt\n", stderr); exit(1)
}
var pages: [String] = []
for index in 0..<pdf.pageCount {
    guard let page = pdf.page(at:index) else { exit(2) }
    let bounds = page.bounds(for:.mediaBox)
    let size = NSSize(width:1800, height:1800 * bounds.height / bounds.width)
    let rendered = page.thumbnail(of:size, for:.mediaBox)
    guard let bitmap = rendered.cgImage(forProposedRect:nil, context:nil, hints:nil) else {exit(3)}
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["en-US", "fr-FR"]
    request.usesLanguageCorrection = false
    try VNImageRequestHandler(cgImage:bitmap, options:[:]).perform([request])
    let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    pages.append(lines.joined(separator:"\n"))
}
try (pages.joined(separator:"\n\u{000C}\n")+"\n\u{000C}").write(toFile:CommandLine.arguments[2], atomically:true, encoding:.utf8)
print("OCR pages: \(pdf.pageCount)")
