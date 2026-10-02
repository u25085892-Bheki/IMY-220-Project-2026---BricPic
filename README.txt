To Run Backend:
cd backend
docker build -t bricpic-backend .
docker run -p 3000:3000 --env-file .env bricpic-backend

To Run Frontend:
cd frontend
docker build -t bricpic-frontend .
docker run -p 5173:5173 bricpic-frontend

link to github : https://github.com/u25085892-Bheki/IMY-220-Project-2026---BricPic