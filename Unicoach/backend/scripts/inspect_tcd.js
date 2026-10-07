const cheerio = require('cheerio');

async function check() {
  const r = await fetch('https://www.tcd.ie/courses/postgraduate/a-z-of-pg-courses/');
  const html = await r.text();
  const $ = cheerio.load(html);
  const courses = [];
  $('a[href*="/courses/postgraduate/courses/"]').each((i, el) => {
    const rawHref = $(el).attr('href');
    const title = $(el).text().trim();
    if (title && rawHref) {
      courses.push({ title, url: new URL(rawHref, 'https://www.tcd.ie').href });
    }
  });
  console.log('Total course links with /courses/postgraduate/courses/:', courses.length);
  console.log('First 5 courses:', courses.slice(0, 5));
}

check();
