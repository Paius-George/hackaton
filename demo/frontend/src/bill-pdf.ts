import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerCode from "pdfjs-dist/build/pdf.worker.min.mjs?raw";
let workerUrl: string | undefined;
export async function pdfText(file: File) {
  if (!workerUrl) {
    workerUrl = URL.createObjectURL(
      new Blob([workerCode], { type: "text/javascript" }),
    );
    GlobalWorkerOptions.workerSrc = workerUrl;
  }
  const task = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });
  try {
    const doc = await task.promise;
    if (doc.numPages > 10) throw Error("Maximum 10 pagini.");
    const chunks = [];
    for (let page = 1; page <= doc.numPages; page++) {
      const content = await (await doc.getPage(page)).getTextContent();
      chunks.push(
        content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
      );
    }
    return chunks.join("\n");
  } finally {
    await task.destroy();
  }
}
