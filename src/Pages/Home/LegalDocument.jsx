import { useMemo } from "react";
import { parseLegalDocument } from "@/lib/legalDocument";
import LegalLayout from "./LegalLayout";

function DocumentBody({ text }) {
  return text.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={index} className="list-disc space-y-2 pl-6">
          {lines.map((line, item) => <li key={item}>{line.slice(2)}</li>)}
        </ul>
      );
    }
    return <p key={index} className="whitespace-pre-line">{block}</p>;
  });
}

export default function LegalDocument({ text, language, title, otherPage, sectionPrefix }) {
  const document = useMemo(() => parseLegalDocument(text), [text]);
  const sections = document.sections.map((section) => ({
    ...section,
    id: `${sectionPrefix}-${section.number}`,
  }));

  return (
    <LegalLayout
      title={title}
      documentTitle={document.title}
      documentIntro={document.introduction}
      documentLanguage={language}
      otherPage={otherPage}
      sections={sections}
    >
      {sections.map(({ id, number, title: sectionTitle, text: body }) => (
        <section key={id} id={id}>
          <h2 className="mb-3 text-2xl font-bold">{number}. {sectionTitle}</h2>
          <div className="space-y-4"><DocumentBody text={body} /></div>
        </section>
      ))}
    </LegalLayout>
  );
}
