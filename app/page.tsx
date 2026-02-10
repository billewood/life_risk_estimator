'use client'

import Link from 'next/link'

interface Project {
  title: string
  description: string
  href: string
  status: 'live' | 'coming-soon'
  external?: boolean
}

const projects: Project[] = [
  {
    title: 'Life Risk Estimator',
    description: 'Evidence-based mortality risk calculator using CDC and AHA data',
    href: '/life-risk-estimator',
    status: 'live',
  },
  {
    title: 'Blooming Songs',
    description: 'Music discovery and playlist creation',
    href: '#',
    status: 'coming-soon',
  },
  {
    title: 'Restaurant Scheduler',
    description: 'Staff scheduling and management for restaurants',
    href: '#',
    status: 'coming-soon',
  },
  {
    title: 'Client Meeting Scheduler',
    description: 'Streamlined scheduling for client consultations',
    href: '#',
    status: 'coming-soon',
  },
  {
    title: 'Scientific Articles',
    description: 'Research publications and academic writing',
    href: '#',
    status: 'coming-soon',
  },
  {
    title: 'Advocacy Work',
    description: 'Community advocacy and policy initiatives',
    href: '#',
    status: 'coming-soon',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bill Wood
          </h1>
          <p className="text-xl text-gray-600">
            Projects & Work
          </p>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.title} className="relative">
              {project.status === 'live' ? (
                <Link
                  href={project.href}
                  className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {project.title}
                    </h2>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-gray-600">{project.description}</p>
                </Link>
              ) : (
                <div className="block bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-300 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-500">
                      {project.title}
                    </h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-gray-400">{project.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Bill Wood</p>
        </footer>
      </div>
    </div>
  )
}
