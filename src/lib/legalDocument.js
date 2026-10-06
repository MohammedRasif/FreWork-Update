export function parseLegalDocument(text) {
  const [title, ...lines] = text.trim().split(/\r?\n/);
  const introduction = [];
  const sections = [];

  for (const line of lines) {
    if (line.trim() === "---") continue;
    const heading = line.match(/^(\d+)\.\s+(.+)$/);
    if (heading) {
      sections.push({ number: heading[1], title: heading[2], lines: [] });
    } else if (sections.length) {
      sections[sections.length - 1].lines.push(line);
    } else {
      introduction.push(line);
    }
  }

  return {
    title,
    introduction: introduction.join("\n").trim(),
    sections: sections.map(({ lines: body, ...section }) => ({
      ...section,
      text: body.join("\n").trim(),
    })),
  };
}
