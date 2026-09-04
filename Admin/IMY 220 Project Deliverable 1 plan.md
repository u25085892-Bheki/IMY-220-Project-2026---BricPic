# PART 1:
complete.
# PART 2:

Doing components for each page:

# Splash Page:
- [Carousel Component] : Slides through images like a carousel/slideshow (find templates online).  Can dev be reused in Home Page.
- Login Component (Login Page) //Actually implement
- Sign Up Component (Sign Up Page) //Actually implement

# Home Page:
- carousel Component
- Navigation Component:
	- reusable for Profile and Posts page
	- Has icons for Home, Profile and Posts with heading underneath, clickable with bric pic logo at the end
- Filter Component:
	- its form that has basic filter functionality like sort by friends or new posts, hashtags and a search component.
- Search Component:
	-  sits within Filter Component and has search functionality which will redirect you to the relevant post's page
- Summary Component:
	- Shows the currently displayed posts, author, description and the posts tags and if the post is new or not
- Feed Swap Component:
	- Swap feed functionality

# Posts Page:
- Navigation Component
- CommentsCard Component
	- has a bunch of Comment Components
- Comment Component:
	- display commentor's username and message
- Post Component:
	- title
	- user icon
	- edit post icon/button which is the PostEdit component
	- displays like count
	- comment input button
	- like input button
	- post description
	- image component
- Image Component:
	- displays image
	- PostEdit Component:
		- a form to edit a post's title and description and hashtags
# Profile Page:
- ProfilePreview Component:
	- holds Profile Component
	- PostGallery Component
- Profile Component:
	- Displays friend status
	- user profile picture with username
	- Bio
	- CreatePost Component:
		- button that links to a form (CreatePost page) to add post:
			- image
			- description
			- title
			- hashtags
	- Friends Component:
		- Shows full list of friends
		- Friend Add button
		- Friend Remove button
- PostGallery Component:
	- A photo grid/ collage of all the user's posts

# PART 3:
- Do validation for the Login Form and Sign Up Form:
	- Password length and must have a capital letter and a symbol (regex)
	- no empty fields
	- correct email format (regex)

# PART 4:
- set up routes for Splash page, Home page, Posts page and profile page
- Splash page should route you to sign up page or login page
- Dynamic routing for Posts page and profile page

# PART 5:
- The endpoints need return appropriate JSON responses 
- An endpoint for Login
- An endpoint for Sign Up
# PART 6:
- create Dockerfile for backend
- create Dockerfile for frontend
- run test containers