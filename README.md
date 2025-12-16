# Task Management Monitoring Platform

## 1. Project Overview

Aplikasi ini adalah **task management berbasis web** yang memungkinkan user untuk membuat, melihat, memperbarui, dan menghapus task mereka.

Project ini dirancang **bukan hanya untuk membangun aplikasi CRUD**, tetapi juga untuk melatih pemahaman tentang **system design dasar, clean architecture, monitoring, dan alerting** seperti yang digunakan pada sistem production.

---

## 2. Project Goals

Tujuan utama project ini adalah:

* Membangun backend API menggunakan Node.js dengan struktur yang rapi dan mudah dikembangkan
* Menggunakan frontend Next.js sebagai client aplikasi
* Memahami alur request dari frontend hingga database
* Mempelajari konsep **observability** melalui metrics, monitoring, dan alerting
* Melatih mindset berpikir sebagai backend / software engineer

---

## 3. Target Users

* User umum yang ingin mengelola task pribadi
* Developer (pembuat project) yang ingin belajar:

  * bagaimana sistem dirancang
  * bagaimana sistem dimonitor
  * bagaimana sistem bereaksi ketika terjadi error

---

## 4. System Architecture Overview

Sistem ini terdiri dari beberapa komponen utama yang saling terhubung.

### Main Components

* **Frontend (Next.js)**
  Menyediakan antarmuka pengguna untuk login dan pengelolaan task, serta mengirim request ke backend API.

* **Backend API (Node.js)**
  Menangani autentikasi, validasi data, logika bisnis task, komunikasi dengan database, serta pencatatan metrics.

* **Database**
  Menyimpan data user dan task secara persisten.

* **Monitoring System**
  Prometheus digunakan untuk mengumpulkan metrics dari backend, sedangkan Grafana digunakan untuk menampilkan metrics tersebut dalam bentuk dashboard.

* **Alerting System**
  Alertmanager mengirimkan notifikasi ke Slack atau Discord ketika kondisi tertentu pada sistem terdeteksi bermasalah.

---

## 5. High-Level Request Flow

1. User mengakses aplikasi melalui frontend web.
2. Frontend mengirim request HTTP ke backend API.
3. Backend memvalidasi request dan menjalankan logika bisnis.
4. Backend mencatat metrics seperti latency dan error.
5. Backend mengirim response kembali ke frontend.
6. Prometheus mengambil metrics dari backend.
7. Grafana menampilkan metrics dalam dashboard.
8. Alertmanager mengirim notifikasi jika metrics melewati threshold.

---

## 6. Functional Requirements

### Authentication

* User dapat melakukan registrasi
* User dapat login menggunakan email dan password
* Sistem menggunakan JWT untuk autentikasi

### Task Management

* User dapat membuat task baru
* User dapat melihat daftar task
* User dapat mengubah task
* User dapat menghapus task
* Mendukung pagination dan filtering sederhana

---

## 7. Non-Functional Requirements

* API harus stabil dan memiliki error handling yang baik
* Response time API dapat dipantau
* Error rate dapat terdeteksi secara otomatis
* Sistem memiliki endpoint health check
* Logging dan metrics tersedia untuk keperluan debugging

---

## 8. Observability Design

### Metrics yang Dikumpulkan

Backend akan mencatat metrics berikut:

* Jumlah request HTTP
* Durasi request (latency)
* Error rate (4xx dan 5xx)
* Jumlah request aktif
* Penggunaan CPU dan memory
* Latency query database

### Monitoring Tools

* **Prometheus**: Mengambil metrics dari backend
* **Grafana**: Menampilkan metrics dalam bentuk dashboard

---

## 9. Alerting Strategy

Alert akan dikirim ketika kondisi berikut terjadi:

* Backend tidak dapat diakses
* Error rate melebihi threshold tertentu
* Latency meningkat secara signifikan
* Penggunaan memory terlalu tinggi

Alert dikirim ke:

* Slack, atau
* Discord

---

## 10. Technology Stack

### Backend

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL
* Prometheus client

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Infrastructure & Monitoring

* Docker & Docker Compose
* Prometheus
* Grafana
* Alertmanager

---

## 11. Project Structure (High-Level)

```
apps/
 ├─ backend/
 └─ frontend/
infra/
 ├─ prometheus/
 ├─ grafana/
 └─ alertmanager/
```

---

## 12. Learning Outcomes

Setelah menyelesaikan project ini, developer diharapkan:

* Memahami alur request end-to-end
* Mengerti konsep monitoring dan alerting
* Mampu membaca metrics dan dashboard
* Terbiasa berpikir tentang kegagalan sistem
* Memiliki project portfolio yang mendekati praktik dunia kerja

---

## 13. Out of Scope

Fitur berikut **tidak dibangun** dalam project ini:

* Microservices architecture
* Kubernetes
* Auto-scaling
* Multi-region deployment

Fokus project ini adalah **pemahaman fundamental**, bukan kompleksitas berlebihan.
