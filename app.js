        const API_URL = "http://localhost:8080";
        let isEditMode = false;
        let selectedBookId = null;

        // ১. ডেটা লোড করা
        async function loadBooks() {
            try {
                const res = await fetch(`${API_URL}/books`);
                const books = await res.json();
                const tbody = document.getElementById('bookTableBody');
                tbody.innerHTML = '';

                books.forEach(book => {
                    tbody.innerHTML += `
                        <tr class="border-b hover:bg-gray-50 transition">
                            <td class="p-3">${book.id}</td>
                            <td class="p-3 font-semibold">${book.title}</td>
                            <td class="p-3">${book.author}</td>
                            <td class="p-3 text-center">
                                <span class="px-3 py-1 rounded-full text-xs font-bold ${book.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                    ${book.status}
                                </span>
                            </td>
                            <td class="p-3 text-center flex justify-center gap-2">
                                <button onclick="toggleStatus(${book.id})" class="text-blue-600 hover:underline text-sm">Status</button>
                                <button onclick="setupEdit(${book.id}, '${book.title}', '${book.author}')" class="text-amber-600 hover:underline text-sm">Edit</button>
                                <button onclick="deleteBook(${book.id})" class="text-red-600 hover:underline text-sm">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            } catch (err) {
                console.error("Error loading books:", err);
            }
        }

        // ২. সাবমিট হ্যান্ডলার (Add/Update)
        async function handleSubmit() {
            const title = document.getElementById('titleInp').value;
            const author = document.getElementById('authorInp').value;

            if (!title || !author) return alert("সব ঘর পূরণ করুন!");

            const payload = { title, author };
            if (isEditMode) payload.id = selectedBookId;

            const endpoint = isEditMode ? `${API_URL}/edit-book` : `${API_URL}/books`;
            const method = isEditMode ? 'PUT' : 'POST';

            await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            resetForm();
            loadBooks();
        }

        // ৩. এডিট মোড সেটআপ
        function setupEdit(id, title, author) {
            document.getElementById('titleInp').value = title;
            document.getElementById('authorInp').value = author;
            isEditMode = true;
            selectedBookId = id;
            document.getElementById('mainBtn').innerText = "Update Book";
            document.getElementById('mainBtn').classList.replace('bg-indigo-600', 'bg-amber-600');
        }

        // ৪. অন্যান্য অ্যাকশন
        async function toggleStatus(id) {
            await fetch(`${API_URL}/update-status?id=${id}`, { method: 'PATCH' });
            loadBooks();
        }

        async function deleteBook(id) {
            if (confirm('মুছে ফেলতে চান?')) {
                await fetch(`${API_URL}/delete-book?id=${id}`, { method: 'DELETE' });
                loadBooks();
            }
        }

        function resetForm() {
            document.getElementById('titleInp').value = '';
            document.getElementById('authorInp').value = '';
            isEditMode = false;
            selectedBookId = null;
            document.getElementById('mainBtn').innerText = "Add Book";
            document.getElementById('mainBtn').classList.replace('bg-amber-600', 'bg-indigo-600');
        }

        // Initial Load
        loadBooks();