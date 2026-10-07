const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function parseDocx(filePath) {
  const options = {
    convertImage: mammoth.images.imgElement(async (image) => {
      const buffer = await image.read();
      const ext = image.contentType.split('/')[1] || 'png';
      const filename = `docx-img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      const destPath = path.join(__dirname, '../uploads', filename);
      
      // Ensure the directory exists
      await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
      await fs.promises.writeFile(destPath, buffer);
      
      const url = `/uploads/${filename}`;
      return { src: url };
    })
  };

  const result = await mammoth.convertToHtml({ path: filePath }, options);
  const html = result.value;

  const sections = [];
  let title = '';

  // Parse top-level HTML tags
  const tagRegex = /<(h[1-4]|p|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;
  
  let inFaqZone = false;
  let currentFaq = null;

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    let content = match[3].trim();

    // Check if the paragraph contains an image
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
    if (imgMatch) {
      const imageUrl = imgMatch[1];
      if (currentFaq) {
        sections.push(currentFaq);
        currentFaq = null;
      }
      sections.push({
        type: 'image',
        url: imageUrl,
        caption: 'Uploaded from document',
        align: 'center'
      });
      continue;
    }

    // Strip HTML tags for text checks
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) continue;

    // Use the first heading as fallback title
    if ((tag === 'h1' || tag === 'h2') && !title && sections.length === 0) {
      title = textContent;
      continue;
    }

    // Check if we entered the FAQ zone
    const lowerText = textContent.toLowerCase();
    if (lowerText === 'faqs' || lowerText === 'faq' || lowerText === 'frequently asked questions') {
      inFaqZone = true;
      if (currentFaq) {
        sections.push(currentFaq);
        currentFaq = null;
      }
      continue;
    }

    // FAQ Question check (e.g. Q: Question text or ends with ?)
    const isQuestion = inFaqZone && (
      /^(q|question)[:.]\s+/i.test(textContent) || 
      textContent.endsWith('?')
    ) || /^(q|question)[:.]\s+/i.test(textContent);

    if (isQuestion) {
      if (currentFaq) {
        sections.push(currentFaq);
      }
      const cleanedQuestion = textContent.replace(/^(q|question)[:.]\s+/i, '');
      currentFaq = {
        type: 'faq',
        question: cleanedQuestion,
        answer: ''
      };
      inFaqZone = true;
    } else if (currentFaq && inFaqZone) {
      if (currentFaq.answer) {
        currentFaq.answer += '<br>' + content;
      } else {
        currentFaq.answer = content;
      }
    } else {
      if (currentFaq) {
        sections.push(currentFaq);
        currentFaq = null;
      }
      
      if (tag.startsWith('h')) {
        const level = parseInt(tag.substring(1)) || 2;
        sections.push({
          type: 'heading',
          level: level,
          content: textContent,
          align: 'left'
        });
      } else {
        sections.push({
          type: 'paragraph',
          content: content,
          align: 'left'
        });
      }
    }
  }

  if (currentFaq) {
    sections.push(currentFaq);
  }

  return { title, sections };
}

module.exports = { parseDocx };
