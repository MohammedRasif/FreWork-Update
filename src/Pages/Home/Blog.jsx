'use client'

import React, { useState } from 'react'

const blogPosts = [
  {
    id: 1,
    title: 'How to Plan Your Perfect Vacation',
    date: 'April 22, 2024',
    description: 'Planning a vacation can be an exciting yet overwhelming experience. In this comprehensive guide, we walk you through every essential step — from choosing the perfect destination to creating a realistic budget, booking flights, and packing like a pro. Whether you\'re a first-timer or a seasoned traveler, these proven strategies will help you craft a trip you\'ll never forget.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  },
  {
    id: 2,
    title: '10 Tips for Stress-Free Travel in 2025',
    date: 'April 15, 2024',
    description: 'Traveling can be stressful, but it doesn\'t have to be. From beating jet lag to avoiding tourist traps and keeping your belongings safe, these 10 practical tips have been tested by thousands of travelers worldwide. Learn how to travel lighter, smarter, and happier — no matter where in the world you\'re headed next.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'
  },
  {
    id: 3,
    title: 'Exploring Nature: The World\'s Most Breathtaking Hiking Trails',
    date: 'April 8, 2024',
    description: 'Ready to reconnect with nature? We\'ve handpicked 15 incredible hiking trails across 5 continents that offer jaw-dropping views, challenging terrain, and unforgettable experiences. From the misty mountains of Patagonia to the ancient paths of the Himalayas, find your next adventure here.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
  },
  {
    id: 4,
    title: 'Why Traveling with Friends Creates the Best Memories',
    date: 'March 30, 2024',
    description: 'Solo travel is great, but nothing beats sharing incredible moments with your best friends. Discover the real benefits of group travel — stronger friendships, shared costs, inside jokes that last a lifetime, and photos that make everyone jealous back home. Plus our top tips to avoid drama on the road!',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop'
  }
]

function BlogCard({ post }) {
  const [expanded, setExpanded] = useState(false)

  const words = post.description.split(/\s+/).filter(w => w.length > 0)
  const isLong = words.length > 80
  const truncated = words.slice(0, 80).join(' ') + '...'

  return (
    <article className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-96 flex-shrink-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-52 md:h-65 object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Content */}
        <div className="flex-1 px-8 md:px-10 lg:px-12 lg:py-5">
          <div className="space-y-4">
            {/* Title */}
            <h2 className="text-3xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {post.title}
            </h2>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h.01a1 1 0 100-2H6zm2 0a1 1 0 000 2h.01a1 1 0 100-2H8zm2 0a1 1 0 000 2h.01a1 1 0 100-2H10zm2 0a1 1 0 000 2h.01a1 1 0 100-2H12zm-8 4a1 1 0 000 2h.01a1 1 0 100-2H6zm2 0a1 1 0 000 2h.01a1 1 0 100-2H8zm2 0a1 1 0 000 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
              </svg>
              <span>{post.date}</span>
            </div>

            {/* Description */}
            <p className="text-[14px] text-gray-600 leading-relaxed">
              {expanded ? post.description : truncated}
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                >
                  {expanded ? 'See less' : 'Read more'}
                </button>
              )}
            </p>

            {/* Optional Read More Button */}
            <div className="">
              <button className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-4 transition-all">
                <span>Continue reading</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export const metadata = {
  title: 'Blog - Travel Stories & Tips',
  description: 'Read inspiring travel stories, practical tips, and destination guides from real adventurers.',
}

export default function Blog() {
  return (
    <main className=" bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-xl md:text-4xl font-bold text-gray-900 
          ">
            Our Travel Blog
          </h1>
          <p className="text-[17px] text-gray-600 max-w-4xl mx-auto">
            Stories, tips, and inspiration from the road. Join thousands of travelers who read our blog every week.
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  )
}