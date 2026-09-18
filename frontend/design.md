
---

version: 1.0
name: PhotoShare Design System
description: |
PhotoShare is a modern photography-first social platform combining a clean,
premium interface with an immersive image-discovery experience.

The visual direction combines a restrained, modern product aesthetic inspired
by Trizen.ai with a photography-first masonry discovery system.

Photography is always the dominant visual element. UI chrome must remain quiet,
minimal, spacious, and functional so that uploaded photographs receive the
highest visual priority.

The application uses neutral surfaces, deep near-black typography, a restrained
violet-blue brand accent, generous whitespace, rounded geometry, subtle borders,
and almost no decorative shadows.

The experience should feel premium, modern, fast, social, and creator-focused
rather than like an enterprise dashboard.

Core product surfaces:
- Authentication
- Home photo feed
- Explore/discovery
- Search
- Photo upload
- Photo detail
- Likes
- Comments
- User profiles
- Follow/follower system
- Collections
- Notifications
- Admin dashboard

---

# 1. Design Philosophy

PhotoShare follows one primary principle:

> The photograph is the interface's strongest visual element.

Navigation, buttons, metadata, cards, dialogs, filters, and controls must support
photography rather than compete with it.

The UI should feel:

* Minimal
* Premium
* Photography-first
* Spacious
* Modern
* Fast
* Friendly
* Creator-focused
* Consistent
* Accessible

Avoid excessive decoration.

Do not use gradients simply to make empty areas interesting.

Do not fill every surface with borders, shadows, cards, or background colors.

Whitespace is an intentional part of the design.

---

# 2. Brand Identity

PhotoShare should NOT visually imitate Pinterest.

Pinterest's masonry and photography-first principles may influence content
presentation, but PhotoShare must maintain its own brand identity.

The visual identity should use:

* Neutral white/off-white surfaces
* Near-black typography
* Violet-blue primary accent
* Muted gray secondary text
* Soft neutral borders
* Rounded interactive controls
* Large photography
* Minimal shadows
* Clean geometric typography

The interface should resemble a modern creative product rather than a traditional
social-network website.

---

# 3. Color System

colors:

primary: "#6366F1"
primary-hover: "#5558E8"
primary-pressed: "#4F46E5"
primary-soft: "#EEF2FF"

accent: "#8B5CF6"
accent-soft: "#F5F3FF"

ink: "#111111"
ink-soft: "#27272A"

body: "#3F3F46"
muted: "#71717A"
placeholder: "#A1A1AA"

border: "#E4E4E7"
border-soft: "#F1F1F3"

canvas: "#FFFFFF"
surface: "#FAFAFA"
surface-soft: "#F7F7F8"
surface-hover: "#F4F4F5"
surface-elevated: "#FFFFFF"

dark: "#111111"
dark-soft: "#18181B"

on-primary: "#FFFFFF"
on-dark: "#FFFFFF"

success: "#16A34A"
success-soft: "#DCFCE7"

warning: "#F59E0B"
warning-soft: "#FEF3C7"

error: "#DC2626"
error-soft: "#FEE2E2"

like: "#EF4444"

overlay: "rgba(0,0,0,0.45)"
overlay-heavy: "rgba(0,0,0,0.65)"

---

# 4. Color Usage

## Primary

`#6366F1`

Use for:

* Primary CTA
* Upload button
* Active navigation indicator
* Follow button
* Submit actions
* Selected controls
* Focus states
* Important links

Do NOT use the primary color as decoration.

There should normally be only one dominant primary CTA in a visual region.

---

## Canvas

`#FFFFFF`

Used for:

* Main application background
* Navigation
* Modal surfaces
* Photo detail panels
* Profile surfaces
* Forms

---

## Surface

`#FAFAFA`

Used for:

* Secondary page sections
* Search backgrounds
* Skeleton loading surfaces
* Empty states
* Secondary panels

---

## Text

Primary:

`#111111`

Secondary:

`#3F3F46`

Muted:

`#71717A`

Placeholder:

`#A1A1AA`

Do not use light-gray text for important information.

---

# 5. Typography

PhotoShare uses:

font-family:
primary: "Inter"
fallback: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"

Inter should be used throughout the application.

Do not use proprietary fonts.

typography:

display-xl:
fontFamily: Inter
fontSize: 64px
fontWeight: 700
lineHeight: 1.05
letterSpacing: -2px

display-lg:
fontFamily: Inter
fontSize: 48px
fontWeight: 700
lineHeight: 1.1
letterSpacing: -1.5px

heading-xl:
fontFamily: Inter
fontSize: 32px
fontWeight: 700
lineHeight: 1.2
letterSpacing: -0.8px

heading-lg:
fontFamily: Inter
fontSize: 24px
fontWeight: 650
lineHeight: 1.25

heading-md:
fontFamily: Inter
fontSize: 20px
fontWeight: 600
lineHeight: 1.3

heading-sm:
fontFamily: Inter
fontSize: 18px
fontWeight: 600
lineHeight: 1.35

body-lg:
fontFamily: Inter
fontSize: 18px
fontWeight: 400
lineHeight: 1.6

body-md:
fontFamily: Inter
fontSize: 16px
fontWeight: 400
lineHeight: 1.5

body-strong:
fontFamily: Inter
fontSize: 16px
fontWeight: 600
lineHeight: 1.5

body-sm:
fontFamily: Inter
fontSize: 14px
fontWeight: 400
lineHeight: 1.45

body-sm-strong:
fontFamily: Inter
fontSize: 14px
fontWeight: 600
lineHeight: 1.45

caption:
fontFamily: Inter
fontSize: 12px
fontWeight: 400
lineHeight: 1.4

button:
fontFamily: Inter
fontSize: 14px
fontWeight: 600
lineHeight: 1

---

# 6. Border Radius

rounded:

xs: 6px
sm: 8px
md: 12px
lg: 16px
xl: 24px
modal: 24px
full: 9999px

Usage:

6px:

* Small controls

8px:

* Tags
* Small buttons

12px:

* Inputs
* Standard buttons

16px:

* Photo cards
* Panels
* Dropdowns

24px:

* Large cards
* Authentication panels
* Modals

9999px:

* Avatars
* Search bar
* Filter pills
* Status chips

Photo cards should normally use `16px`.

---

# 7. Spacing

spacing:

xxs: 4px
xs: 8px
sm: 12px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
section: 64px
section-lg: 96px

Base spacing unit:

8px

Use consistent multiples of 8 wherever possible.

Photo-grid gaps may use:

8px desktop
6px mobile

---

# 8. Layout

## Desktop Container

max-width:

1440px

Standard horizontal padding:

32px

Large desktop:

48px

Tablet:

24px

Mobile:

16px

---

# 9. Main Navigation

Desktop navigation:

Height:

72px

Properties:

background: white
position: sticky
top: 0
z-index: 50
border-bottom: 1px solid #F1F1F3

Structure:

[PhotoShare] [Home] [Explore] -------- [Search] -------- [Upload] [Notifications] [Avatar]

PhotoShare logo remains on the far left.

Search should receive the largest flexible region.

User actions remain on the right.

---

# 10. Mobile Navigation

Top:

[PhotoShare] [Search] [Notifications]

Bottom navigation:

[Home]
[Explore]
[Upload]
[Activity]
[Profile]

The Upload action may receive stronger visual emphasis.

Bottom navigation:

position: fixed
bottom: 0
height: 64px
background: rgba(255,255,255,0.96)
backdrop-filter: blur(16px)
border-top: 1px solid #E4E4E7

Do not use a hamburger menu for core application navigation.

---

# 11. Search Bar

component.search:

height: 48px
background: #F4F4F5
border: 1px solid transparent
radius: full
padding: 0 18px

Placeholder:

"Search photos, people, tags..."

Focused:

background: white
border: 1px solid #6366F1

Do not use a heavy box shadow.

---

# 12. Buttons

## Primary

background: #6366F1
text: #FFFFFF
height: 44px
padding: 0 18px
radius: 12px
font-weight: 600

Use for:

Upload
Follow
Publish
Save changes
Continue
Create account

Hover:

#5558E8

Pressed:

#4F46E5

---

## Secondary

background: #F4F4F5
text: #18181B
height: 44px
padding: 0 18px
radius: 12px

Use for:

Cancel
Following
Edit profile
Back

---

## Ghost

background: transparent
text: #3F3F46

Hover:

background: #F4F4F5

---

## Destructive

background: #DC2626
text: white

Only use for confirmed destructive operations.

Examples:

Delete photo
Delete account
Remove user

---

# 13. Photo Feed

The home feed is the application's main visual surface.

Photography receives priority over UI chrome.

Desktop:

Use a masonry layout.

Recommended:

> 1440px = 5 columns
> 1280px = 4 columns
> 1024px = 3 columns
> 768px = 2 columns
> < 520px = 2 compact columns or 1 feed column depending on page context

Explore should favor masonry.

Following/Home may use a more social feed layout.

---

# 14. Masonry Photo Grid

Preserve original photo aspect ratios.

Supported:

1:1
4:5
3:4
2:3
3:2
16:9

Never force all uploaded photographs into identical square cards.

Photo:

width: 100%
height: auto
object-fit: cover
border-radius: 16px

Gap:

8px desktop
6px mobile

No card shadow.

No white frame around each photograph.

The image itself is the card.

---

# 15. Photo Card

component.photo-card:

background: transparent
radius: 16px
overflow: hidden
position: relative

Structure:

PHOTO
├─ creator
├─ like
├─ comment
├─ share
└─ save

Desktop actions may appear through a subtle overlay.

Mobile actions should remain touch-accessible.

---

# 16. Photo Hover Overlay

Desktop only.

When hovering:

overlay:
linear-gradient(
transparent,
rgba(0,0,0,0.55)
)

Do not darken the entire image excessively.

Top-right:

Save

Bottom-left:

Avatar
Username

Bottom-right:

Like
Comment
Share

Icons:

white

Text:

white

Transitions:

150–200ms ease

Do not scale the image aggressively.

Maximum image scale:

1.015

---

# 17. Like Interaction

Default:

heart-outline

Liked:

heart-filled
color: #EF4444

Animation:

scale 1 → 1.15 → 1

Duration:

180ms

Double-clicking/tapping a photo may trigger Like.

If used, display a temporary centered heart animation.

---

# 18. Photo Detail Page

Desktop:

two-column layout.

Left:

65%

Large photograph.

Right:

35%

Information panel.

Structure:

---

|                                   |
|             PHOTO                 |

|                                     |
| ----------------------------------- |
| Creator                             |
| Caption                             |
| Tags                                |
| Like · Comment · Share · Save       |
| ----------------------------------- |
| Comments                            |
| Comment input                       |

---

On very wide displays, the photograph should not be stretched beyond its useful
resolution.

Background around photograph:

#111111

This allows photography to remain visually dominant.

---

# 19. Photo Detail Mobile

Stack vertically:

Photo
Creator
Actions
Caption
Tags
Comments

Image:

width: 100%

Avoid excessive side padding around the photograph.

---

# 20. User Avatar

Sizes:

xs: 24px
sm: 32px
md: 40px
lg: 56px
xl: 96px
profile: 128px

Shape:

circle

object-fit:

cover

Fallback:

user initials on `primary-soft`.

---

# 21. Profile Page

Desktop structure:

Avatar

Display Name
@username

Bio

Followers · Following

[Follow] [Message]

Tabs:

Photos
Collections
Liked

Then:

Masonry Photo Grid

Profile header max width:

900px

The profile should feel clean and editorial.

Do not wrap every profile statistic in a card.

---

# 22. Upload Page

Upload is a major product action.

Desktop layout:

---

| Upload Area | Photo Details    |
|             |                 |
|             | Caption         |
|             | Tags            |
|             | Location        |
|             | Visibility      |
|             |                 |
|             | Publish         |
---------------------------------

Upload area:

border: 1px dashed #D4D4D8
background: #FAFAFA
radius: 24px

Minimum height:

480px

Content:

Upload icon

"Drag and drop your photo"

"or choose a file"

Supported format helper text.

---

# 23. Upload Preview

After selection:

Display image preview immediately.

Allow:

Replace
Crop
Rotate
Remove

Do not hide the original aspect ratio.

Never automatically crop without user control.

---

# 24. Comments

Comment:

[avatar] username comment text
time · like · reply

Spacing:

16px vertical

Do not put each comment inside a bordered card.

Replies indent:

40px

Comment input:

avatar + rounded input + Send

---

# 25. Notifications

Notification row:

[avatar] username action description [thumbnail]

Examples:

"Alex liked your photo."

"Sarah started following you."

"John commented: Amazing shot!"

Unread:

background: #F5F3FF

Read:

background: white

Use a small primary indicator for unread items.

---

# 26. Collections

Collections allow users to organize saved photos.

Collection card:

large cover image
title
photo count

Radius:

16px

Avoid heavy shadows.

Use photography as the collection cover.

---

# 27. Authentication

Authentication should be cleaner than the main discovery interface.

Desktop:

split layout.

Left:

Photography / brand experience

Right:

Authentication form

Example:

---

|                                              |
|        PHOTOGRAPHY                           |
|                                              |
|                         Welcome back         |
|                         Email                |
|                         Password             |
|                         Sign in              |
|                                              |
------------------------------------------------

The photography panel should demonstrate the product itself.

---

# 28. Authentication Card

max-width:

440px

padding:

40px

Do not use an unnecessarily floating card when the page already has a clean
split layout.

Heading:

32px / 700

Supporting copy:

16px / muted

Input spacing:

16px

---

# 29. Inputs

height:

48px

radius:

12px

background:

white

border:

1px solid #D4D4D8

padding:

0 16px

Focused:

border: #6366F1

focus-ring:

0 0 0 3px rgba(99,102,241,0.12)

Error:

border: #DC2626

Do not rely on red borders alone.

Always provide error text.

---

# 30. Modals

Desktop:

max-width: 520px
radius: 24px
padding: 32px

Overlay:

rgba(0,0,0,0.45)

Shadow:

0 20px 60px rgba(0,0,0,0.16)

Use modals only for focused tasks:

Delete confirmation
Report photo
Share
Collection picker
Account confirmation

Do not use modal dialogs for normal page navigation.

---

# 31. Icons

Use one consistent icon library.

Recommended:

Lucide React

Icon style:

outline
1.75–2px stroke

Common icons:

Home
Compass
Search
Plus
Upload
Heart
MessageCircle
Share2
Bookmark
Bell
User
Settings
MoreHorizontal
Camera
Image
Trash
X

Do not mix multiple icon families.

Do not use emoji as interface icons.

---

# 32. Admin Dashboard

The admin dashboard may use denser UI than the consumer application.

Navigation:

Dashboard
Users
Photos
Reports
Events
Moderation
Settings

Admin colors must still use the same design tokens.

Admin surfaces may use:

white cards
1px borders
16px radius

Avoid excessive dashboard shadows.

---

# 33. Admin Statistics

Example cards:

Total Users
Total Photos
Active Users
Reported Photos

Cards:

background: white
border: 1px solid #E4E4E7
radius: 16px
padding: 24px

Statistics:

32px / 700

Label:

14px / muted

---

# 34. Empty States

Empty states should be simple.

Example:

[icon]

No photos yet

Upload your first photo and start sharing.

[Upload photo]

Do not use giant illustrations unless they provide meaningful context.

---

# 35. Loading

Use skeleton loading for:

Photo grids
Profile
Comments
Notifications

Photo skeleton:

background: #F4F4F5
radius: 16px

Preserve estimated image aspect ratio whenever known.

Avoid page-wide blocking spinners.

---

# 36. Toasts

Position:

top-right desktop
bottom-center mobile

Radius:

12px

Examples:

Photo uploaded successfully
Profile updated
Photo deleted
Something went wrong

Duration:

3–5 seconds

Do not show toasts for actions already obvious from the UI.

---

# 37. Responsive Breakpoints

breakpoints:

mobile-small: 320px
mobile: 480px
mobile-large: 640px
tablet: 768px
laptop: 1024px
desktop: 1280px
desktop-large: 1440px
ultrawide: 1920px

---

# 38. Responsive Photo Grid

Ultrawide:

5–6 columns

Desktop:

4–5 columns

Laptop:

3–4 columns

Tablet:

2–3 columns

Mobile:

2 columns for Explore

Single column may be used for the social Following feed.

Do not automatically make every mobile photo grid single-column.

---

# 39. Mobile Experience

Mobile is not a compressed desktop interface.

Prioritize:

Photos
Search
Upload
Likes
Comments
Profile navigation

Move primary navigation to bottom.

Reduce secondary controls.

Use sheets instead of centered dialogs where appropriate.

Minimum touch target:

44 × 44px

---

# 40. Image Rules

All images must:

preserve aspect ratio
use object-fit appropriately
lazy load when below fold
have meaningful alt text
show loading state
show failure fallback

Use:

loading="lazy"

for non-critical grid images.

Hero/first-visible photos may load eagerly.

---

# 41. Image Performance

Prefer responsive images.

Use:

srcset
sizes
modern image formats
server-generated thumbnails

Grid pages should load optimized thumbnails rather than original uploaded files.

Full-resolution photos should only load when needed.

---

# 42. Motion

Motion should communicate state rather than decorate the interface.

Standard transition:

150ms ease

Large transition:

200–250ms ease

Use animation for:

Like
Modal entrance
Menu entrance
Toast
Upload progress
Skeleton replacement

Avoid:

large bouncing effects
continuous animation
background animation
excessive parallax

Respect:

prefers-reduced-motion

---

# 43. Accessibility

Minimum contrast:

WCAG AA

Minimum touch target:

44 × 44px

Every interactive control requires:

keyboard access
visible focus state
accessible name

Every meaningful photo requires:

alt text

Forms require:

label
error description
focus handling

Do not communicate state through color alone.

---

# 44. Elevation

Level 0:

No shadow.

Use for:

Photo cards
Profile
Feed
Navigation sections

Level 1:

border only.

Use for:

Inputs
Panels
Admin cards

Level 2:

subtle shadow.

Use for:

Dropdowns
Popovers

Level 3:

modal shadow.

Use only for:

Dialogs
Critical overlays

Photography should provide most of the visual depth.

---

# 45. Do

* Let photography dominate the interface.
* Preserve original image aspect ratios.
* Use masonry layouts for discovery.
* Use Inter consistently.
* Keep navigation clean.
* Use one primary brand accent.
* Use generous whitespace.
* Use 16px photo-card radii.
* Use 12px input/button radii.
* Keep metadata visually secondary.
* Make upload extremely easy to discover.
* Design mobile independently.
* Keep actions accessible.
* Use subtle borders instead of unnecessary shadows.
* Keep primary CTAs visually obvious.
* Use consistent iconography.
* Optimize images aggressively.

---

# 46. Don't

* Don't copy Pinterest branding.
* Don't use Pinterest Red.
* Don't use Pin Sans.
* Don't make every image square.
* Don't put every element inside a card.
* Don't add unnecessary gradients.
* Don't use excessive shadows.
* Don't use glassmorphism everywhere.
* Don't use neon colors.
* Don't mix icon libraries.
* Don't use random border radii.
* Don't use emoji for application controls.
* Don't hide important actions behind hover on mobile.
* Don't crop user photography without reason.
* Don't add decorative UI over photographs.
* Don't make the admin dashboard determine the visual style of the consumer app.
* Don't create oversized navigation.
* Don't use animation simply because it is available.

---

# 47. Page-Specific Rules

## Login

Clean split layout.

Photography left.

Authentication right.

No navbar.

No footer required above fold.

---

## Register

Same visual language as Login.

Keep form width below 440px.

Use progressive disclosure if registration becomes long.

---

## Home

Sticky navigation.

Following/recommended content.

Photography-first.

Minimal chrome.

---

## Explore

Search.

Category/filter chips.

Dense masonry grid.

Infinite scroll or pagination.

---

## Photo Detail

Large photo first.

Creator and social actions second.

Comments third.

Related photographs below.

---

## Upload

Large drag/drop target.

Immediate preview.

Simple metadata form.

Clear Publish CTA.

---

## Profile

Strong identity header.

Simple statistics.

Photo grid dominates lower portion.

---

## Admin

Structured sidebar.

Data tables.

Statistics.

Moderation controls.

Use the same global design tokens.

---

# 48. Desktop Navigation Example

PhotoShare

Home
Explore

[ Search photos, people, tags... ]

Upload

Heart
Bell

[Avatar]

---

# 49. Mobile Navigation Example

TOP

PhotoShare                     Search   Bell

CONTENT

Photography

BOTTOM

Home   Explore   +   Activity   Profile

---

# 50. Visual Priority

Every screen should approximately follow:

1. Photography / primary task
2. Page title or creator identity
3. Primary action
4. Navigation
5. Social interactions
6. Metadata
7. Secondary actions

Never allow metadata or chrome to visually overpower a photograph.

---

# 51. Product Personality

PhotoShare should feel:

Creative but disciplined.

Social but not noisy.

Premium but approachable.

Minimal but not empty.

Modern but not trend-dependent.

Photography-first but still highly usable.

The UI should disappear when users are browsing photographs and become obvious
only when users need to perform an action.

---

# 52. Implementation Guidance

For React frontend:

Use reusable primitives:

Button
IconButton
Avatar
Input
SearchInput
PhotoCard
PhotoGrid
UserChip
FollowButton
Comment
Modal
BottomSheet
Toast
Skeleton
EmptyState

Build pages by composing these primitives.

Do not independently style the same component on every page.

---

# 53. CSS Token Mapping

Recommended CSS variables:

:root {
--color-primary: #6366F1;
--color-primary-hover: #5558E8;
--color-primary-soft: #EEF2FF;

--color-text: #111111;
--color-body: #3F3F46;
--color-muted: #71717A;

--color-background: #FFFFFF;
--color-surface: #FAFAFA;
--color-surface-soft: #F7F7F8;

--color-border: #E4E4E7;

--color-error: #DC2626;
--color-success: #16A34A;
--color-like: #EF4444;

--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;

--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-section: 64px;

--container-max: 1440px;
}

---

# 54. AI Coding Agent Instructions

When implementing PhotoShare:

1. Read this DESIGN.md before creating or modifying UI.
2. Reuse existing design tokens.
3. Do not invent new colors unless absolutely necessary.
4. Do not invent new border-radius values.
5. Use Inter.
6. Use Lucide icons.
7. Preserve photograph aspect ratios.
8. Prefer masonry for discovery surfaces.
9. Prefer neutral backgrounds.
10. Keep shadows minimal.
11. Use the primary accent only for important actions and states.
12. Maintain responsive behavior.
13. Make every interaction keyboard accessible.
14. Provide loading, empty, error, and success states.
15. Do not redesign existing components independently.
16. Treat uploaded photography as the most important visual content.
17. Do not blindly reproduce Pinterest components.
18. Keep PhotoShare branding consistent across user and admin surfaces.

Before adding a new component, first determine whether it can be built by composing
an existing PhotoShare primitive.

---

# 55. Final Design Rule

When there is uncertainty between:

"adding more UI"

and

"letting the photograph breathe"

choose:

"letting the photograph breathe."

PhotoShare should feel like a carefully designed frame around the user's
photography, not a UI competing for attention with it.
