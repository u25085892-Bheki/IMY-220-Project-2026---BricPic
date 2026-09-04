To Run Backend:
cd backend
docker build -t bricpic-backend .
docker run -p 3000:3000 bricpic-backend

To Run Frontend:
cd frontend
docker build -t bricpic-frontend .
docker run -p 5173:5173 bricpic-frontend