package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Book struct {
	ID     int    `db:"id" json:"id"`
	Title  string `db:"title" json:"title"`
	Author string `db:"author" json:"author"`
	Status string `db:"status" json:"status"`
}

var db *sqlx.DB

func main() {
	// আপনার সঠিক পাসওয়ার্ড এবং ডাটাবেস নাম এখানে দিন
	dsn := "user=postgres password=123456 dbname=library_db sslmode=disable"

	var err error
	db, err = sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalln("Database connection failed:", err)
	}

	http.HandleFunc("/books", handleBooks)
	http.HandleFunc("/edit-book", editBook)
	http.HandleFunc("/update-status", updateStatus)
	http.HandleFunc("/delete-book", deleteBook)

	fmt.Println("Backend Server: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func handleBooks(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" { return }

	if r.Method == http.MethodGet {
		search := r.URL.Query().Get("search")
		books := []Book{}
		var err error
		if search != "" {
			err = db.Select(&books, "SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1 ORDER BY id DESC", "%"+search+"%")
		} else {
			err = db.Select(&books, "SELECT * FROM books ORDER BY id DESC")
		}
		if err != nil { http.Error(w, err.Error(), 500); return }
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(books)

	} else if r.Method == http.MethodPost {
		var b Book
		json.NewDecoder(r.Body).Decode(&b)
		db.Exec("INSERT INTO books (title, author, status) VALUES ($1, $2, 'Available')", b.Title, b.Author)
		fmt.Fprint(w, "Created")
	}
}

func editBook(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" { return }
	var b Book
	json.NewDecoder(r.Body).Decode(&b)
	db.Exec("UPDATE books SET title=$1, author=$2 WHERE id=$3", b.Title, b.Author, b.ID)
	fmt.Fprint(w, "Updated")
}

func updateStatus(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	id := r.URL.Query().Get("id")
	db.Exec("UPDATE books SET status = CASE WHEN status='Available' THEN 'Borrowed' ELSE 'Available' END WHERE id=$1", id)
	fmt.Fprint(w, "Toggled")
}

func deleteBook(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" { return }
	id := r.URL.Query().Get("id")
	db.Exec("DELETE FROM books WHERE id=$1", id)
	fmt.Fprint(w, "Deleted")
}