# Design hand-off: Illia's Figma file, mapped to this repository

Rewritten for this repository from the backend's `docs/developers/design-handoff.md` (written by Backend on 4 November
2026 from the two Figma exports Raf shared, checked again on 6 November 2026; the open questions in section 6 are
still open and are answered by Illia and Raf). Backend read the file only to write the guide: **Backend does not
build the design.**

**The design is Illia's, and it is the source of truth for the look.** This page maps it onto this repository: which
screen is which route, which Figma component is which kit component, and how his tokens differ from ours. Where this
page and the Figma disagree about the look, the Figma wins. Where the Figma disagrees with the **words**, the
**data**, the **switches** or the **legal text**, the API wins (section 5, and
[`frontend-guide.md`](frontend-guide.md), "The one boundary").

Read with: [`frontend-guide.md`](frontend-guide.md), [`../TOKENS.md`](../TOKENS.md),
[`../CONTRIBUTING.md`](../CONTRIBUTING.md). No picture from the file is copied into the repository, and none should
be: open the Figma itself.

---

## 1. The two files

|                         | `Visigain [Design].fig`              | `Visigain [Design] (1).fig` |
| ----------------------- | ------------------------------------ | --------------------------- |
| `meta.json` `file_name` | Visigain [Design]                    | Visigain [Design]           |
| `exported_at`           | 2026-10-31 11:23:38 UTC              | 2026-10-31 11:24:12 UTC     |
| size                    | 31.0 MB                              | 31.0 MB                     |
| thumbnail               | 384 × 400, a wide view of the canvas | 400 × 48, a strip           |
| contents                | 6 pages, 115,928 nodes, 61 images    | the same                    |

**They are the same design, exported 34 seconds apart.** Decoded node by node (Figma's `fig-kiwi` format, schema
version 106), both have the same 115,928 nodes, the same 61 images, the same variables, styles and components. The only
differences are (a) the thumbnail, which shows a different part of the canvas, (b) cached image-preview data on
about 1,770 image fills and strokes (a thumbnail hash and the preview's size, not the image), and (c) one colour
rounded differently (`Colors/Accents/Highlights/Pink Darken`, #FB7AEE in both after rounding). Either file will do;
everything below holds for both.

## 2. Pages and screens

The file has five visible pages and Figma's hidden internal page.

| Figma page                    | what it holds                                                                                                                          | for the developer                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Done**                      | 7 sections, 45 screen frames (28 different screens), 61 handoff notes ("Handoff / …" and numbered "Note / …" cards beside the screens) | **build from this page**                   |
| **Components**                | the design system: Typography, Colors, Buttons, Icon Button, Checkbox, Radiobutton, Text Fields, Tables, Atoms, Molecules, Organisms   | the kit (section 3) and tokens (section 4) |
| In Review                     | rounds R1 to R3 of the dashboard, with a list of review notes (round R2)                                                               | history; Done supersedes it                |
| Workbench                     | Illia's working copies (R1 to R4, list variants A/B/C of the full report's evidence list)                                              | history; do not build from it              |
| Bin                           | 11 discarded frames from another project (an events and leads app)                                                                     | ignore                                     |
| Internal Only Canvas (hidden) | Figma's store of styles, plus a large component library inherited from a CRM/outreach template                                         | see section 3, "Inherited components"      |

Every desktop screen is **1440 px** wide; the mobile screens are **390 px**. There is no tablet frame.

### 2.1 The Done page, screen by screen

"Plan" is the dashboard's plan level (Free, Full Report, Monitoring), which the same
route switches on.

| Done section                              | screen (frame name)                                                                  | width      | route                                                                      | notes                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard                                 | Monitoring — main (3 copies)                                                         | 1440       | `/dashboard` (Monitoring plan)                                             | 12 numbered notes describe each block                                                                                                          |
| Dashboard                                 | Monitoring — sidebar collapsed (note only)                                           | 1440       | `/dashboard`                                                               | **new**: the client sidebar has no collapsed state today                                                                                       |
| Dashboard › Your key numbers              | Monitoring — changes since (2); hover on a change badge; hover on the grade chart    | 1440       | `/dashboard`                                                               | tooltips are new                                                                                                                               |
| Dashboard › General states                | More menu; navigation; notifications open; account menu open; business switcher open | 1440       | `/dashboard` (header)                                                      | **No route yet**: a notifications bell for clients, a "Tracked keywords" editor, "Weekly check settings" as a menu, an "Email reports" setting |
| Dashboard › Your key numbers — grades A–F | Grade A, B, C, D, F                                                                  | 544        | `/dashboard` (the grade block)                                             | the colours match ours (section 4.1)                                                                                                           |
| Dashboard › 3 levels                      | No business — main · numbered                                                        | 1440       | `/dashboard` with no business ("Getting started"), `/dashboard/onboarding` | the frame's $99 for the Full Report is today's price (US$99 since 14 October 2026); draw it from GET /pricing, never the frame                 |
| Dashboard › 3 levels                      | Free scan — main                                                                     | 1440       | `/dashboard` (Free plan)                                                   | the public free grade result is `/scan/[token]` and `/grade/[domain]`, not designed here                                                       |
| Dashboard › 3 levels                      | Full Report — main                                                                   | 1440       | `/dashboard` (Full Report plan)                                            |                                                                                                                                                |
| Dashboard › Mobal                         | Monitoring — mobile; mobile menu open                                                | 390        | `/dashboard` (on a phone)                                                  | sidebar becomes a top bar and a full-screen menu                                                                                               |
| Dashboard                                 | Monitoring — first week                                                              | 1440       | `/dashboard` (first week of Monitoring)                                    |                                                                                                                                                |
| Dashboard                                 | Monitoring — empty blocks                                                            | 1440       | `/dashboard` (each panel's empty state)                                    | the API has more states per section (frontend-guide.md, section 3)                                                                             |
| Local Search Grid                         | Local Search Grid — main (2)                                                         | 1440       | `/dashboard/grid`                                                          |                                                                                                                                                |
| Citations                                 | Citations — main (2); Card / All 36 directories (long-list variant)                  | 1440, 1108 | `/dashboard/citations`                                                     |                                                                                                                                                |
| Reports                                   | Reports — main (2)                                                                   | 1440       | `/dashboard/orders`                                                        |                                                                                                                                                |
| Reports                                   | Sample report — main (2)                                                             | 1440       | `/sample-report`                                                           | drawn inside the signed-in shell; ours is a public page                                                                                        |
| Rank tracking                             | Rank tracking — main (2)                                                             | 1440       | `/dashboard/ranks`                                                         |                                                                                                                                                |
| Full report                               | Full report — main; main (collapsed); 3 evidence-list options                        | 1440       | `/dashboard/reports/[id]`                                                  |                                                                                                                                                |
| Dark mode                                 | Monitoring, Local Search Grid, Citations, Rank tracking, Reports, Sample report      | 1440       | the same routes in the dark theme                                          | made with the "Dark Mode" variable mode (section 4.1)                                                                                          |

**Pages in the sidebar with no design frame:** Listing (`/dashboard/listing`), Reviews (`/dashboard/reviews`),
Progress (`/dashboard/progress`), Monitoring (`/dashboard/monitoring`), Share your grade (`/dashboard/share`), Settings
(`/dashboard/settings`), and the account pages (`/account`, team, sessions). The design's sidebar labels are exactly
the backend's current ones (they will be wording keys): Overview, Local Search Grid, Rank tracking, Citations, Reviews, Listing,
Reports, Progress, Monitoring, Share your grade, Settings, Sign out. Nothing is designed for the public site, the
sign-in pages, checkout, the PDFs or the emails.

### 2.2 What the design shows that is off, or refused, in production

The design shows the product as it may become. A screen that shows any of these is built **behind its switch**, and
the switched-off state is what production shows (the backend's switches; the ones a page sees are in `GET /api/v1/site`, or a section's `status`):

| shown in the design                                                                | switch                                                                      | state                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Pause monitoring" in the ••• menu ("billing pauses at the end of the period")     | `PAUSE_SUBSCRIPTION_ENABLED`                                                | off; refused in production. Waits for a Terms version after 3.17 (Raf, 4 November 2026)                                                                                                                                                                                                                                        |
| "Connect Google Business Profile" block (drawn as "Coming later", button disabled) | `GOOGLE_CONNECT_ENABLED`                                                    | off. The "Coming later" panel itself is approved copy and exists today                                                                                                                                                                                                                                                         |
| "Use the same colours … (reports, share card, emails)": a share card               | `SHARE_REPORT_ENABLED`; the public badge page is `VISIBILITY_BADGE_ENABLED` | off; the badge is refused in production                                                                                                                                                                                                                                                                                        |
| First-week to-do list with an item set to "This week"                              | the first-week checklist is `QUICK_WINS_ENABLED`                            | off; refused in production                                                                                                                                                                                                                                                                                                     |
| Account menu "Billing and credit (current credit as a tag)"                        | referral credit is `REFERRAL_CREDIT_ENABLED`                                | off. The report's 14-day Monitoring credit is live and is not this switch                                                                                                                                                                                                                                                      |
| Review text in "Newest Google and Yelp reviews"                                    | (data)                                                                      | our Reviews page shows date, stars and replied or not, and says "We never show who wrote it". Review texts are held only as the review-reply writer's copies (the fixers, refused in production), cleared after 12 months (`RETENTION_REVIEW_TEXTS_ENABLED`). Showing full review text is a product decision, not a layout one |

**Not in the design at all** (so nothing to hide): the free AI check (`FREE_AI_CHECK_ENABLED`), the partner program
(`PARTNER_PROGRAM_ENABLED`), the Spanish site (`SPANISH_SITE_ENABLED`), the benchmark and AI Visibility Index pages
(`BENCHMARK_PAGES_ENABLED`, `BENCHMARK_INDEXING_ENABLED`) and the retention emails. All of them are staging-only or
refused in production today. The "AI-assistant visibility" block in the design is the Monitoring dashboard's own
panel (approved copy, live), not the free AI check.

## 3. Components

The file has 1,487 components (Figma calls them symbols), of which 85 are component sets with variants. **Visigain's own
kit is on the Components page.** The hidden internal page also holds a large library inherited from a CRM/outreach
template (lead cards, inbox, LinkedIn steps, calendars, campaign variables); most of it is unused by the Done screens
and is not Visigain's.

### 3.1 Visigain's component sets (Components page)

"Uses" is how many instances the whole file has. The last column names the component the current app (visigain-backend) has, so you can see how it behaves; this repository builds its own kit.

| Figma component set                                                          | variants and properties                                                                                                                                                                                                      | uses           | the backend's component today (for behaviour; rebuild here)                                                                                                               |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`                                                                     | 150: Configuration = Filled, Outlined, Text Primary, Text Secondary, Outlined Secondary; Icon = none, left, right; State = Normal, Hovered, Focused, Pressed, Disabled; Size = Large, Medium, Small                          | 541            | `Button`, `ButtonLink` (`ui.tsx`: variants `go`, `primary`, `secondary`, `danger`); site `PrimaryAction`, `ActionLink` (`site/kit.tsx`). No text-only or small size today |
| `Icon Buttons`                                                               | 105: Type = On Surface, On Page, Transparent, Secondary, Primary, Destructive, Transparent Destructive; State (5); Assignment = Normal, Notification (with dot); Size = Large, Medium, Small                                 | 699            | **new** (no icon-button component; `ThemeToggle` draws its own)                                                                                                           |
| `Text Field`                                                                 | 108: Type = Text Field, With icons, Paragraph, Drop Down, Date Picker; State = Enabled, Focused, Hovered, Filled, Error, Disabled; Size = Default, Small; Place of use = On Surface, On Page                                 | 62             | `Field`, `Input`, `Textarea`, `Select` (`ui.tsx`)                                                                                                                         |
| `Input with lable`                                                           | 7: two inputs, normal, error, supporting text, warning, with icon button, date-time                                                                                                                                          | 73             | `Field` (`ui.tsx`)                                                                                                                                                        |
| `checkbox`                                                                   | 10: Active, Inactive × 5 states                                                                                                                                                                                              | 43             | `Checkbox` (`ui.tsx`)                                                                                                                                                     |
| `Radiobutton`                                                                | 10: Active, Inactive × 5 states                                                                                                                                                                                              | 3              | **new** as a component (radios are written inline on the account page)                                                                                                    |
| `switch - 44`                                                                | 10: selected × 5 states                                                                                                                                                                                                      | 12             | **new**                                                                                                                                                                   |
| `Header`                                                                     | 13: Align = Left, Center, Right, Check; Sort = None, Up, Down, Hovered                                                                                                                                                       | 597            | table head of `DataTable` (`client/table.tsx`) and `CaptionTable` (`v2/kit.tsx`)                                                                                          |
| `Cell`                                                                       | 110: Type = Text, Number, Action, Switcher, Check, Input, Icon, Text-Accent, Button + text, 2 actions, Status icon, Text + Tag; Divider; Size = Small, Default, Large (60 px); State = Default, Hovered; property "Show tag" | 6,098          | cells of `DataTable` and `CaptionTable`                                                                                                                                   |
| `Tag`                                                                        | 4: Color = Dark, Orange, Green, Neutral; property Label                                                                                                                                                                      | 1,404          | `Badge` (`ui.tsx`), `Pill` (`client/table.tsx`)                                                                                                                           |
| `Progress badge`                                                             | 3: Trend = Up, Down, No change; property Label                                                                                                                                                                               | 894            | `Change` (`v2/kit.tsx`)                                                                                                                                                   |
| `Checklist item`                                                             | 3: Default, Done, Numbered; properties Task, Divider, Number                                                                                                                                                                 | 476            | the to-do list and fix list in `v2/dashboard.tsx`; `v2/quick-wins.tsx`                                                                                                    |
| `Tag / h2 skipped`                                                           | 4: Default, Hover × Left, Right                                                                                                                                                                                              | 180            | purpose to confirm with Illia (an evidence tag on a finding, by its use)                                                                                                  |
| `Sidebar`                                                                    | 2: Collapsed = False (284 px), True (84 px)                                                                                                                                                                                  | 107            | `ClientShell` (`client/shell.tsx`); collapsing is new                                                                                                                     |
| `Sidebar / Nav item`                                                         | 4: Default, Active × collapsed or not; properties Label, Icon                                                                                                                                                                | 64             | `ClientSidebarNav` (`client/sidebar-nav.tsx`)                                                                                                                             |
| `Tab` (and `Tabs`)                                                           | 2: Active, Inactive; property Label                                                                                                                                                                                          | 8 (+49)        | `Choices` (`v2/kit.tsx`, pills as links)                                                                                                                                  |
| `visigain-logo`                                                              | 2: full, short (icon only)                                                                                                                                                                                                   | 35             | `ThemedLogo`, `LogoIcon` (`brand/logo.tsx`). The short logo is drawn **green**: see section 6                                                                             |
| `Status icon`                                                                | 2: Success, Error                                                                                                                                                                                                            | 8              | **new** (the ✓ / ✕ of "Question by question" are inline today)                                                                                                            |
| `Progress line`, `Progress with %`                                           | 5: 0, 30, 50, 70 %, completed                                                                                                                                                                                                | 3, 3           | **new** (progress bars are inline in each page)                                                                                                                           |
| `Drop-down items`, `Drop down`                                               | items: normal, selected, nested; Normal, Accent, Destructive; menus of 2 to 5 actions                                                                                                                                        | 74, 4          | **new** (the header menus)                                                                                                                                                |
| `Notification`                                                               | 3: success, error, warning                                                                                                                                                                                                   | 0              | `Alert` (`ui.tsx`)                                                                                                                                                        |
| `Tooltip`, `Scroll Control`, `_Sub-headline`, `More`, `Less`                 | single components                                                                                                                                                                                                            | 9, 9, 21, 1, 0 | **new** (tooltips, the horizontal scroll indicator on mobile, "Show N more")                                                                                              |
| `Multiselector`, `Filter Buttons`, `Remainder`, `Drop a file`, `Action list` |                                                                                                                                                                                                                              | 0              | not used by any screen                                                                                                                                                    |
| `icon/…`                                                                     | 100 single icons (chevrons, search, arrows …)                                                                                                                                                                                | 3,188          | no icon set in the repository today; icons are inline SVG                                                                                                                 |

### 3.2 Components drawn on the In Review page

`Credit pill` (Default, Hover), `Info tooltip — How we asked` (Default, Hover), `Business switcher` (Default, Open).
The R2 review notes ask to remove the credit pill from the header; the Done screens follow that.

### 3.3 Inherited components the screens use

From the hidden page, the Done screens use a few generic pieces: `Badge` (count and dot), `Tab Item`, `Menu_item`,
`Chips`, `Tip` (check, cross), `Avatars`, `Account`, `Pop-up items`, `Icon Buttons`, `.calendar-cell`. The rest of
that library (lead cards, inbox items, LinkedIn steps, calendars, notifications of "new leads" and "birthdays") is
not part of Visigain.

## 4. Tokens

Illia's tokens are Figma **variables** in two local collections: `Primitives` (one mode, 55 colours and 12 numbers)
and `Tokens` (two modes, **Light Mode** and **Dark Mode**, 63 colours, 6 radii, 2 booleans). The Dark mode screens
switch the mode; nothing else changes. Three more collections are empty library links. The file's 110 colour
**styles** are almost all leftovers from the template (blues, purples, Material 3); the Done screens use the
variables, so build from the variables.

Our side: `src/brand/tokens.ts` is the only place a value is written; `pnpm tokens` writes the CSS
([`../TOKENS.md`](../TOKENS.md)). Nothing here has been changed. Each difference below is a decision for Raf and
Illia before it goes into `tokens.ts`.

### 4.1 Colours (the `Tokens` collection) against our `THEME`

"Uses" counts fills and strokes on the Done page.

| Illia's token                                                            | Light                        | Dark                      | uses          | our token (light / dark)             | difference                                                                                                                   |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------------- | ------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Surfaces/Page                                                            | #EFEEE9                      | #0F0F0E                   | 157           | `bg` #FAF6EE (paper) / #0E0F0F (ink) | **page is grey-beige, not paper**; paper is a brand colour                                                                   |
| Surfaces/Surface                                                         | #FFFFFF                      | #1A1A18                   | 3,779         | `surface` #FFFFFF / #1A1C1C          | dark differs slightly                                                                                                        |
| Surfaces/On Surface                                                      | #F8F7F3                      | #222220                   | 781           | `surface2` #F2EEE5 / #252828         | lighter                                                                                                                      |
| Surfaces/On Surface Darken                                               | #F4F3EF                      | #262624                   | 62            | none                                 | new                                                                                                                          |
| Surfaces/On Page                                                         | #EBE9E3                      | #2C2C29                   | 90            | none                                 | new                                                                                                                          |
| Surfaces/Main                                                            | #19C865                      | #19C865                   | 489           | `green` #19C865                      | same                                                                                                                         |
| Surfaces/Overlay                                                         | #0E0F0F at 40 %              | #000000 at 60 %           |               | none                                 | new (modal scrim)                                                                                                            |
| Surfaces/Glass Surface, Surface Fade                                     | white 70 %; transparent      |                           |               | none                                 | new (the fades at the end of scrolling lists)                                                                                |
| Elements/Primary                                                         | #0E0F0F                      | #F3F2EE                   | 3,766         | `fg` #0E0F0F / #FFFFFF               | dark text is off-white, not white                                                                                            |
| Elements/Secondary                                                       | #686A67                      | #9D9D97                   | 1,754         | `muted` #5C5F5F / #9A9D9D            | lighter in light mode: 5.5:1 on white but **4.7:1 on the page colour** (ours: 6.0:1 on paper)                                |
| Elements/Tertiary                                                        | #9B9C98                      | #75756F                   | 139           | `faint` (= `muted`)                  | **2.8:1 on white, 2.4:1 on the page, 3.8:1 dark: fails WCAG AA for text**                                                    |
| Elements/On Primary                                                      | #FFFFFF                      | #0E0F0F                   | 319           | `bg` on `fg`                         |                                                                                                                              |
| Elements/Main, On Main                                                   | #19C865; #0E0F0F             | same                      | 169           | `green`; ink on green                | same (ink on green 8.7:1)                                                                                                    |
| Elements/Disabled, Track                                                 | #D8D6CF                      | #4A4A45, #3A3A36          | 827           | none                                 | new (progress-bar track)                                                                                                     |
| Elements/Success Text                                                    | #067647                      | #5FDC96                   | 152           | `ok` #067647 / #47CD89               | dark differs                                                                                                                 |
| Elements/Warning Text                                                    | #7A4D00                      | #F5C45A                   | 81            | `warn` #B54708 / #FDB022             | **different hue**: brown, not orange                                                                                         |
| Elements/Error Text                                                      | #B42318                      | #F0806F                   |               | `danger` #B42318 / #F97066           | dark differs                                                                                                                 |
| Elements/Accent, Acent Red                                               | #EF7A2B; #E0412F             | same                      |               | grade D, grade F                     |                                                                                                                              |
| Borders/Border                                                           | #EBE9E3                      | #2C2C29                   | 2,888         | `line` #DDD7CA / #2F3232             | lighter (1.2:1 on white)                                                                                                     |
| Borders/Border Darken                                                    | #D8D6CF                      | #3A3A36                   | 492           | `lineStrong` #8C867A / #6E7272       | **1.45:1 on white**: form-field borders must stay at 3:1 or better (WCAG 1.4.11, our 6 October rule)                         |
| Borders/Accent                                                           | #0E0F0F                      | #F3F2EE                   | 33            | `fg`                                 |                                                                                                                              |
| Borders/Chart Grid                                                       | #E6E4DD                      | #33332F                   | 71            | none                                 | new                                                                                                                          |
| Main States/Hovered, Focused, Pressed                                    | #3FD47F; #15AC57; #0F8F47    | same                      |               | `greenDark` #15AC57 for hover        | hover is lighter in the design, darker in ours                                                                               |
| Main States/Tonal Hovered, Focused, Pressed                              | #F0FBF4; #E3F6E9; #C8EED6    | #112619; #15301F; #1C4029 |               | `greenTint` #DFF7E9                  | new scale                                                                                                                    |
| Main States/Disabled                                                     | #E6E4DD                      | #33332F                   |               | none (we use 50 % opacity)           |                                                                                                                              |
| Accents/Backgrounds/Green                                                | #E3F6E9                      | #15301F                   | 404           | `okSoft` #E7F6EC / #0F2A1B           | close                                                                                                                        |
| Accents/Backgrounds/Red                                                  | #FDECEA                      | #3A1D1B                   | 21            | `dangerSoft` #FDECEA / #3A1512       | light same                                                                                                                   |
| Accents/Backgrounds/Orange Light                                         | #FDF3DC                      | #352A14                   | 166           | `warnSoft` #FEF4E6 / #33220F         | close                                                                                                                        |
| Accents/Backgrounds/Orange, Blue, Blue Light, Purple, Green Darken       | various                      | various                   |               | none                                 | new                                                                                                                          |
| Accents/Alerts/Success, Warning, Error (+ Error hovered/focused/pressed) | #19C865, #F2B01E, #E0412F    | same                      | 198 (warning) | grade colours                        |                                                                                                                              |
| Accents/Highlights/Green, Orange, Red, Purple, Blue, Pink (+ Darken)     | #8CE4B2, #EF7A2B, #E0412F, … | same                      | about 250     | `CHART` palette is different         | **two variables each are named Highlights/Blue, /Purple, /Green, /Orange, /Purple Darken with different values** (section 6) |
| Map/Background, Map/Streets                                              | #EEF0EA, #E2E6DC             | #1C1E1B, #2C2F2A          | 48            | the base map's own style             | compare with the map style before changing it                                                                                |
| Theme/Is Light, Is Dark                                                  | booleans                     |                           |               |                                      | used to show the right logo per mode                                                                                         |

**The grade colours match ours exactly**: A #19C865, B #8CE4B2, C #F2B01E, D #EF7A2B, F #E0412F (`GRADE_COLOR`).
Illia's note: "Grade boundaries come from the Visigain Standard; the design only maps the letter to a colour."

**The `Primitives`** behind them: Neutral 00 to 100 (#FFFFFF … #0E0F0F, warm greys), Neutral Dark 00 to 100, Main 10
to 90 (Main/50 = brand green #19C865, Main/60 = #15AC57 = our `greenDark`), Accent 10 to 60, Error 10 to 70. Neutral/100
is our ink. **Our paper (#FAF6EE) and paper 2 (#F2EEE5) are not in the design at all**, and neither is ink 2 (#1A1C1C).

### 4.2 Type

Text on the Done page: **Geist 87 %, Poppins 13 %** (5,261 and 786 text layers), plus two stray layers in Manrope and
SF Pro. Poppins is used at **Medium (500) only**; Geist at Regular, Medium and SemiBold.

| Illia's text style | font        | size / line | letter-spacing | uses (Done) | nearest role of ours (`TYPE_ROLE`, Poppins) |
| ------------------ | ----------- | ----------- | -------------- | ----------- | ------------------------------------------- |
| Display/L 48\|48   | Poppins 500 | 48 / 48     | -4 %           | 30          | none (site `display` is 800, clamp 36–64)   |
| Display/M 40\|44   | Poppins 500 | 40 / 44     | -3.5 %         | 37          | none                                        |
| Display/S 36\|36   | Poppins 500 | 36 / 36     | -3.5 %         | 202         | `figureLarge` 24 / 32, 700                  |
| Headline/L 32\|36  | Poppins 500 | 32 / 36     | -3 %           | 30          | none                                        |
| Headline/M 28\|34  | Poppins 500 | 28 / 34     | -2.5 %         | 11          | none                                        |
| Headline/S 22\|28  | Poppins 500 | 22 / 28     | -2 %           | 283         | `pageTitle` 20 / 28, 600                    |
| Title/L 20\|26     | Poppins 500 | 20 / 26     | -1.5 %         | 13          | `subhead` 20, 700                           |
| Title/M 18\|24     | Poppins 500 | 18 / 24     | -1 %           | 40          | `figure` 18 / 28, 700                       |
| Title/S 16\|22     | Poppins 500 | 16 / 22     | -1 %           | 186         | `cardTitle` 16 / 24, 700                    |
| Label/L 15\|20     | Geist 500   | 15 / 20     | 0              | 439         | none                                        |
| Label/M 14\|20     | Geist 500   | 14 / 20     | 0              | 1,102       | `label` / `button` 14 / 20, 600             |
| Label/S 12\|16     | Geist 500   | 12 / 16     | 0              | 1,702       | `badge` 12 / 16, 500                        |
| Body/L 15\|22      | Geist 400   | 15 / 22     | 0              | 38          | none                                        |
| Body/M 14\|20      | Geist 400   | 14 / 20     | 0              | 731         | `body` 14 / 20                              |
| Paragraph/M 14\|21 | Geist 400   | 14 / 22     | 0              | 79          | none                                        |
| Body/S 13\|18      | Geist 400   | 13 / 18     | 0              | 955         | `tableCellDense`, `dataCell` 13             |

The Components page's "Typography" sheet lists a different scale (Display Large 58/64, Headline Small 22/32, Body
Small 12/18 …) from the styles the screens actually use. Build from the styles above; the sheet is out of date
(section 6).

### 4.3 Spacing, radii, shadows, grid

|                              | design                                                                                                                                                   | ours                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| spacing variables            | Numbers 0, 8, 10, 12, 16, 20, 24, 28, 32, 40                                                                                                             | `SPACING_UNIT` 4 px; `panel` 20 px, `stack` 24 px, `section` 64 px               |
| gaps used most (auto layout) | 10, 8, 4, 6, 16, 12, 14, 20                                                                                                                              | multiples of 4 px (half steps allowed)                                           |
| paddings used most           | 10, 8, 20, 4, 28, 16, 14, 12                                                                                                                             | `panel` 20 px                                                                    |
| radius variables             | ES 10, S 12, M 16, L 20, INF 999, 0                                                                                                                      | `md`/`input`/`tile` 10, `icon` 12, `card` 16, `siteCard` 18, `pill`/`button` 999 |
| radii as drawn               | big cards ("Card / Visibility Grade" …) **28**, panels 20, rows 14, links 6, buttons and tags pill (999)                                                 | card **16**                                                                      |
| shadows as drawn             | floating menus 0 24 64 ink 16 % (once 0 24 60 ink 15 %); 1, 3 and 5 px rings (spread, no blur) as outlines and focus rings                               | `SHADOW.float` 0 24 60 ink **28 %**; "no shadows except on floating elements"    |
| effect styles                | Elevation 1 and 2, glass and background blurs: template leftovers, not used on the Done screens                                                          |                                                                                  |
| layout                       | desktop 1440: sidebar 284 px (84 collapsed; content then 1308 px); grid styles 12 columns, 16 px gutter. Mobile 390: 4 columns, 16 px margins and gutter | `CONTAINER.site` 72 rem for the public site; the client frame has no fixed grid  |
| strokes                      | 1 px almost everywhere                                                                                                                                   | 1 px                                                                             |

### 4.4 The biggest differences, in short

1. **Font: Geist for body and labels.** Brand v1.2 is "Poppins only, from our own files", and the backend's brand
   test fails on any other font. Geist needs Raf's brand decision first.
2. **Heading weight: Poppins 500** everywhere, where ours is 600 to 800.
3. **Page colour #EFEEE9** instead of paper #FAF6EE; paper and paper 2 do not appear in the design.
4. **Contrast:** Tertiary text fails AA (2.4 to 2.8:1); Secondary is 4.7:1 on the page colour; Border Darken is 1.45:1,
   below the 3:1 our form-field borders keep.
5. **Card radius 28 and panel radius 20** instead of 16.
6. **Warning text is brown (#7A4D00)**, not our orange (#B54708); dark-mode status tones differ.
7. **Dark mode text is #F3F2EE**, not white; dark surfaces are a warmer black.

## 5. Copy: the words in the design are placeholders

Every word a client reads comes from the approved catalogue (`GET /api/v1/wordings`, by key), or is `ApprovedText`
the API serves. **Never copy a sentence from the Figma into code.** Much of the design's text is approved copy, but
some is not, and the two look alike. A sentence the design needs that has no key goes to Backend as a question
([`../CONTRIBUTING.md`](../CONTRIBUTING.md), section 2).

Places where the design's text is known to differ from what is approved:

| where                           | what differs                                                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard subtitle              | the design's date and day line is not the approved one (the business name, the weekly slot, the latest reading)                                                              |
| Full report, Monitoring credit  | the design's credit sentence is shorter than the approved two sentences                                                                                                      |
| Connect Google Business Profile | the approved sentence also names the date of the latest photo                                                                                                                |
| Block titles                    | there is no approved "Your key numbers" row; the listing block has another approved title                                                                                    |
| Reviews tile                    | the design's label has a typo; the approved label is different                                                                                                               |
| Report fine print               | an old refund paragraph; the legal text comes only from the API (`/legal/*`, `/checkout/terms`)                                                                              |
| Prices                          | some frames show other prices; today's are US$99 for the Full Report and US$149 a month for Monitoring, and a page always reads them from `GET /api/v1/pricing`, never typed |

The design also uses **a real business's name, domain, people and competitors, and real-looking reviews** as sample
data. None of it may appear in this repository, a test, a screenshot or a pull request: use invented `*.test`
businesses, as the mock does.

## 6. Open questions for Illia and Raf

1. **Geist.** Is Geist part of the brand now? Brand v1.2 is Poppins only (self-hosted, tested). If yes, Raf updates
   the brand and Backend its font test; if no, Illia confirms the type scale in Poppins.
2. **Poppins 500 for headings** where the brand says 600 (UI), 700 (subheads), 800 (display): which wins?
3. **The page colour.** #EFEEE9 replaces paper #FAF6EE inside the dashboard? On the public site too?
4. **Contrast.** Tertiary text (#9B9C98 / #75756F) fails AA; Secondary on the page colour is 4.7:1; Border Darken on
   form fields is 1.45:1. May we darken them to pass (and which values)?
5. **The short logo is green** (the collapsed sidebar). Our rule: the logo is one colour, ink or white, never green.
   The R2 review notes ask for "only the green icon when it's closed": does that need a brand change?
6. **Duplicate variable names.** `Colors/Accents/Highlights/Blue`, `/Purple`, `/Green`, `/Orange` and `/Purple Darken`
   each exist twice in `Tokens` with different values (for example Purple #C19AFF and #6D8AF8). Which is meant?
7. **The Typography sheet** on the Components page lists a different scale (58/64, 44/52 …) from the text styles in
   use (48/48, 40/44 …). The styles are the truth?
8. **By-area bar colours.** The Sample report note gives three bands (70+ green, 50–69 amber, below 50 orange); the
   Full report note gives four (adds 25–49 orange, below 25 red). One rule for both?
9. **Card radius 28 and panel radius 20** against our 16: new tokens, or should cards stay 16?
10. **Missing screens:** Listing, Reviews, Progress, Monitoring, Share your grade, Settings, Account; the notifications
    panel's settings; Tracked keywords; Weekly check settings. Designed later, or built in the kit's style?
11. **Features behind switches** (section 2.2): pause, Google connect, share card. Keep them in the design, marked as
    later? (Raf, 6 November 2026: Google connect opens with Listings, day 60, so it needs the locked-module state too.)
12. **Review texts.** The design shows full review texts; our Reviews page promises date, stars and replied or not.
    A product decision for Raf before any layout.
13. **Sample data.** Replace the real business, its competitors and its people in the Figma with invented ones before
    the file is shared further.
14. **`Tag / h2 skipped`**: what is this component for?
