export default async function handler(req, res) {
  const url = "https://api.github.com/repos/andriizukr-a11y/Links1/contents/bookmarks.xbel";

  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github.raw"
    },
    cache: "no-store"
  });

  const text = await response.text();

  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(text);
}
