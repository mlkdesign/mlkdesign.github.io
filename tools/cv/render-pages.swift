// Renders every page of a PDF to JPEG: swift render-pages.swift <pdf> <outDir> <prefix>
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 4, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  fputs("usage: render-pages.swift <pdf> <outDir> <prefix>\n", stderr)
  exit(1)
}

let width: CGFloat = 1240 // ~150 dpi for A4
for index in 0..<doc.pageCount {
  guard let page = doc.page(at: index) else { continue }
  let bounds = page.bounds(for: .mediaBox)
  let scale = width / bounds.width
  let size = NSSize(width: width, height: (bounds.height * scale).rounded())
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: Int(size.width), pixelsHigh: Int(size.height),
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  let context = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.current = context
  let cg = context.cgContext
  cg.setFillColor(NSColor.white.cgColor)
  cg.fill(CGRect(origin: .zero, size: size))
  cg.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: cg)
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.82])!
  let out = URL(fileURLWithPath: args[2]).appendingPathComponent("\(args[3])-\(index + 1).jpg")
  try! data.write(to: out)
  print("  \(out.lastPathComponent)")
}
