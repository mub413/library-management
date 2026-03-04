   const API = "http://localhost:8080";
        let editId = null;

        async function loadBooks() {
            const search = document.getElementById('searchBar').value;
            const res = await fetch(`${API}/books?search=${search}`);
            const books = await res.json();
            
            const tbody = document.getElementById('bookList');
            tbody.innerHTML = books.map(b => `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-4 text-gray-500">#${b.id}</td>
                    <td class="p-4 font-bold text-gray-800">${b.title}</td>
                    <td class="p-4 text-gray-600">${b.author}</td>
                    <td class="p-4 text-center">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${b.status==='Available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}">
                            ${b.status}
                        </span>
                    </td>
                    <td class="p-4 text-center space-x-2">
                        <button onclick="toggleStatus(${b.id})" class="text-indigo-600 hover:underline font-medium">Status</button>
                        <button onclick="setEdit(${b.id}, '${b.title}', '${b.author}')" class="text-amber-600 hover:underline font-medium">Edit</button>
                        <button onclick="deleteBook(${b.id})" class="text-red-500 hover:underline font-medium">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        async function handleSubmit() {
            const title = document.getElementById('titleInp').value;
            const author = document.getElementById('authorInp').value;
            if(!title || !author) return alert("দয়া করে সব ঘর পূরণ করুন!");

            const url = editId ? `${API}/edit-book` : `${API}/books`;
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { id: editId, title, author } : { title, author };

            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            clearForm();
            loadBooks();
        }

        function setEdit(id, title, author) {
            editId = id;
            document.getElementById('titleInp').value = title;
            document.getElementById('authorInp').value = author;
            document.getElementById('submitBtn').innerText = "Update Book";
            document.getElementById('submitBtn').className = "bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition";
        }

        async function toggleStatus(id) {
            await fetch(`${API}/update-status?id=${id}`, { method: 'PATCH' });
            loadBooks();
        }

        async function deleteBook(id) {
            if(confirm('বইটি কি মুছে ফেলতে চান?')) {
                await fetch(`${API}/delete-book?id=${id}`, { method: 'DELETE' });
                loadBooks();
            }
        }

        function clearForm() {
            editId = null;
            document.getElementById('titleInp').value = '';
            document.getElementById('authorInp').value = '';
            document.getElementById('submitBtn').innerText = "Add Book";
            document.getElementById('submitBtn').className = "bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition";
        }

        loadBooks();