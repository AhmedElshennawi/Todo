# GIS Drawing Kanban

A simple web-based Kanban board to track GIS drawing progress.

## 📂 Project Structure
```
GIS_Kanban/
├── index.html      # Main interface
├── scripts.js      # Application logic
├── styles.css      # Styling
├── data.json       # Example data
```

## 🚀 Features
✅ Add new drawing to "To Do" column.  
✅ Drag & drop tasks between columns (To Do → In Progress → Done).  
✅ Edit assigned person, start date, and drawing number.  
✅ Tracks days in progress.  
✅ Delete individual tasks.  
✅ Export tasks to JSON file.  
✅ Import tasks from JSON file.  
✅ Clear all tasks at once.  

## 🖥️ How to Use

1️⃣ Open `index.html` in your web browser.  
2️⃣ Click **Add Drawing** to add a new task.  
3️⃣ Drag tasks to the appropriate column.  
4️⃣ Use the ✏️ Edit and 🗑️ Delete buttons as needed.  
5️⃣ Use **Export JSON** to save progress.  
6️⃣ Use **Import JSON** to load saved tasks.  
7️⃣ Use **Clear All** to delete all tasks.

## 📄 JSON File Format
Example:
```json
[
  {
    "id": "1",
    "drawing": "421-B124-AB-C-24-XX0020-001/001",
    "status": "todo",
    "assigned": "",
    "startDate": "",
    "completedBy": ""
  }
]
```

## 📦 Deployment
You can deploy this app as a static site:
- Place files on any web server.
- Or open `index.html` directly on your computer.

## 📧 Support
For questions or suggestions, feel free to reach out!
