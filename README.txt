Cardfile — Free vCard Resume Website Template by uiCookies
https://uicookies.com/

Cardfile is a free vCard resume website template built on Bootstrap 5, shown as
the personal site of a fictional Bergen web designer. It is one page laid out as
a single centred card styled like a filed index card: a profile column with an
initials portrait stamp, role, availability, contact list, social links and a
Download vCard button, plus four divider tabs — About (biography, service cards,
testimonial, client wordmarks), Resume (experience and education timelines,
skill bars with written levels, tools, languages), Portfolio (filterable grid
with a <dialog> lightbox) and Contact (validated form). Headlines are set in
Bricolage Grotesque, text in IBM Plex Sans, with light and dark themes. It is
completely jQuery-free, every section is visible without JavaScript, and motion
respects prefers-reduced-motion.

WHAT'S INSIDE
  index.html            The vCard: profile column + About, Resume, Portfolio
                        and Contact tabs, project lightbox
  css/vendor/           Bootstrap 5 (minified, self-hosted)
  css/style.css         Template design layer (palette, type, components,
                        dark theme, print CV)
  js/vendor/            Bootstrap 5 bundle (includes Popper)
  js/main.js            Template behaviour — vanilla JavaScript, no jQuery
  img/                  Demo photographs (public domain, see CREDITS.txt)
  CREDITS.txt           Source and licence of each demo photograph

NOTES
  - Built on Bootstrap 5.3.8. No jQuery, no plugin dependencies.
  - Colours, fonts and radii are CSS custom properties at the top of
    css/style.css. The dark theme is the block right below them; change
    --accent in both to rebrand every highlight.
  - Tabs are ARIA tabs (arrow keys, Home, End) and each section has its own
    link: index.html#about, #resume, #portfolio, #contact. Links to anything
    inside a section, such as #skills, open the right tab. Without JavaScript
    the sections stack and the tabs work as jump links.
  - Download vCard builds a .vcf file in the browser from the elements marked
    data-vcard in the profile column (name, role, email, phone, website, city,
    note). Edit those and the downloaded contact card follows.
  - Print CV (or the browser's print command) prints all four sections on one
    A4 or Letter page; tabs, buttons, the form and photos are left out. Keep
    the text to a similar length so it still fits.
  - The portrait is an illustrated monogram stamp in SVG; replace it with an
    <img> of your own photo if you prefer.
  - Websites and branding thumbnails are HTML and CSS mock-ups that scale into
    the lightbox; replace a .thumb block with an <img> of your own work. The
    filter reads each project's data-cat attribute; the lightbox shows the
    title, meta, description and the data-role text.
  - The theme toggle follows the system setting until the visitor chooses,
    then remembers the choice in this browser.
  - Forms are front-end only; point the form action at your backend or a form
    service to make them live.
  - Replace the demo photographs in img/ with your own before launch.

LICENSE
  Free for personal and commercial use. Attribution is optional but always welcome — https://uicookies.com/license/
