import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  subjects = [
    { name: 'Tiếng Anh', description: 'Luyện thi THPT Quốc Gia môn Tiếng Anh với đề thi và dạng câu hỏi mới nhất', image: 'https://images.unsplash.com/photo-1546410531-b4cece40916a?w=400&q=80', color: '#e8f0fe' },
    { name: 'Toán', description: 'Bộ đề thi thử THPT Quốc Gia môn Toán có đáp án và lời giải', image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&q=80', color: '#fce8e6' },
    { name: 'Vật Lý', description: 'Bộ đề thi thử THPT Quốc Gia môn Vật Lí có chấm điểm và giải chi tiết', image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80', color: '#e6f4ea' },
    { name: 'Hóa Học', description: 'Luyện thi THPT Quốc Gia môn Hóa Học có chấm điểm và lời giải chi tiết', image: 'https://images.unsplash.com/photo-1603126854598-fbb10aca3946?w=400&q=80', color: '#fef7e0' },
    { name: 'Sinh Học', description: 'Luyện thi THPT Quốc Gia môn Sinh Cỏ đáp án và lời giải chi tiết', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80', color: '#f3e8fd' },
    { name: 'Lịch Sử', description: 'Luyện thi THPT Quốc Gia môn Lịch Sử có đáp án và lời giải chi tiết', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80', color: '#e8eaed' },
    { name: 'Địa Lý', description: 'Luyện thi THPT Quốc Gia môn Địa Lí có đáp án và lời giải chi tiết', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80', color: '#e4f7fb' },
    { name: 'Ngữ Văn', description: 'Luyện thi THPT Quốc Gia môn Ngữ Văn với dạng bài hay thi và văn mẫu', image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?w=400&q=80', color: '#fce4ec' },
  ];
}
