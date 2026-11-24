# GANSWON (간손원)

A minimalist streetwear shop for **GANSWON** (간손원).
Final project for Web Design, Fall 2026.

**Live site:** https://onev1ta.github.io/GANSWON-1/

## What the site does

- **Opening screen:** a full-screen campaign photo. The red 간손원 seal stamps in, shrinks up like a logo, and **SHOP NOW** glides down to the shop.
- **Shop:** a carousel of the 4 totes (ATIVZUL, SUMMER JOY, WABISABI, EAGL). It slides by itself, and you can use the arrows or swipe on a phone.
- **Product page:** photos plus a short video, swipeable on phones, with **BUY NOW** and **ADD TO CART** buttons.
- **Cart:** a bag drawer where you can change the quantity or remove an item. It is saved in the browser with `localStorage`.
- **Checkout:** shipping form, discount code, and card, PayPal or Apple Pay options. This is a demo, so nothing is charged and card details are never saved or sent.
- **Text sign-up pop-up:** a phone number sign-up that gives the code `GANSWON7` for 7% off.
- **Launch stopwatch:** stays at zero until launch day, then counts up forever.
- **Responsive:** separate layouts for phones (600px and under), tablets and computers.

## APIs (both free, no key needed)

| API | Where | What it does |
|---|---|---|
| [Zippopotam.us](https://www.zippopotam.us) | Checkout | Type a 5-digit ZIP and the city and state fill in by themselves. |
| [Frankfurter](https://frankfurter.dev) | Product page | Pick a currency and the price converts using today's exchange rate. |

Both use `fetch` with `async/await` and `try/catch`. If an API can't be reached, the site falls back to a small saved list so it never breaks.

## Files

- `index.html`: page structure (opening screen, shop, product page, cart, checkout, thank-you).
- `style.css`: all styling, animations and phone/tablet layouts.
- `script.js`: products list, page switching (`route()`), cart, checkout, both APIs, carousel and stopwatch.
- Photos and videos are in the main folder next to the code.

## Built with

HTML, CSS and JavaScript, with no frameworks. Hosted on GitHub Pages.
