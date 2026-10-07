const { cleanSocialLinks } = require('../unicoach/services/socialLinks');

describe('cleanSocialLinks', () => {
  it('keeps known https links, trims them and fills the rest with empty strings', () => {
    const { links, error } = cleanSocialLinks({
      linkedin: '  https://www.linkedin.com/in/prachi  ',
      instagram: 'https://instagram.com/prachi',
    });
    expect(error).toBeUndefined();
    expect(links).toEqual({
      linkedin: 'https://www.linkedin.com/in/prachi',
      instagram: 'https://instagram.com/prachi',
      twitter: '',
      youtube: '',
      github: '',
      website: '',
    });
  });

  it('drops keys that are not social profiles', () => {
    const { links } = cleanSocialLinks({ website: 'https://example.com', isVerified: true, email: 'x@y.z' });
    expect(Object.keys(links)).toEqual(['linkedin', 'instagram', 'twitter', 'youtube', 'github', 'website']);
    expect(links.website).toBe('https://example.com');
  });

  it('rejects links that are not plain http(s) URLs', () => {
    expect(cleanSocialLinks({ linkedin: 'javascript:alert(1)' }).error).toMatch(/LinkedIn/);
    expect(cleanSocialLinks({ youtube: 'www.youtube.com/@me' }).error).toMatch(/YouTube.*https/);
    expect(cleanSocialLinks({ website: 'https://example.com/"><script>' }).error).toMatch(/Website/);
    expect(cleanSocialLinks({ twitter: `https://x.com/${'a'.repeat(400)}` }).error).toMatch(/X \(Twitter\)/);
  });

  it('allows clearing a link and rejects a non-object payload', () => {
    expect(cleanSocialLinks({ linkedin: '' }).links.linkedin).toBe('');
    expect(cleanSocialLinks('https://linkedin.com').error).toBeTruthy();
    expect(cleanSocialLinks(['https://linkedin.com']).error).toBeTruthy();
  });
});
