import { Component, OnInit } from '@angular/core';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [
    {
      id: 1,
      title: 'Exploring the Blue Mountains: A Hiker\'s Paradise',
      excerpt: 'Discover why the Blue Mountain Peak is the ultimate challenge for tropical adventure seekers. From lush trails to the crisp morning air at 7,402ft.',
      category: 'Hiking',
      author: 'Aiden Walker',
      date: 'March 20, 2026',
      image: 'https://images.unsplash.com/photo-1542332213-31f87348057f-k-hiking?q=80&w=2070&auto=format&fit=crop',
      readTime: '6 min read'
    },
    {
      id: 2,
      title: 'Tropical Gear Essentials: What to Pack for Your Island Trek',
      excerpt: 'Stay light and dry. Our guide to the moisture-wicking tech and durable footwear you need for the rugid Jamaican interior.',
      category: 'Gear Guide',
      author: 'Island Outdoor Team',
      date: 'March 18, 2026',
      image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop',
      readTime: '4 min read'
    },
    {
      id: 3,
      title: 'The Hidden Waterfalls of Portland',
      excerpt: 'Go beyond the tourist traps. We explore the secluded rivers and cascades tucked deep within the hills of East Jamaica.',
      category: 'Adventure',
      author: 'Maya Green',
      date: 'March 15, 2026',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop',
      readTime: '8 min read'
    },
    {
      id: 4,
      title: 'Camping Under the Stars at Holywell',
      excerpt: 'Everything you need to know about setting up camp in Jamaica\'s premier National Park. Tips on fires, weather, and wildlife.',
      category: 'Camping',
      author: 'Chris Storm',
      date: 'March 10, 2026',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop',
      readTime: '5 min read'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
}
