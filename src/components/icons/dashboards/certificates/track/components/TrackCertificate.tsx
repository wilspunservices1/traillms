'use client'

import React, { useState } from 'react'

interface Certificate {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  createdAt: string
  courseTitle: string | null
}

export default function TrackCertificateComponent() {
  const [searchInput, setSearchInput] = useState('')
  const [certificateData, setCertificateData] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return

    setIsLoading(true)
    setError(null)
    setCertificateData(null)

    try {
      // Get all certificates and filter locally
      const response = await fetch('/api/manageCertificates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include credentials
      })

      if (!response.ok) {
        throw new Error('Failed to fetch certificates')
      }

      const certificates = await response.json()
      console.log('All certificates:', certificates) // Debug log

      // Find the matching certificate
      const matchingCertificate = certificates.find((cert: Certificate) => 
        cert.title.toLowerCase() === searchInput.toLowerCase()
      )

      if (!matchingCertificate) {
        throw new Error('Certificate not found')
      }

      setCertificateData(matchingCertificate)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to find certificate')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Track Certificate</h1>
        <p className="text-gray-600">Enter the certificate title to check its status</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2">
          <label htmlFor="searchInput" className="text-sm font-medium text-gray-700">
            Enter Certificate Title
          </label>
          <div className="flex gap-2">
            <input
              id="searchInput"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter certificate title exactly as it appears"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${(isLoading || !searchInput.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Searching for certificate...</p>
        </div>
      )}

      {certificateData && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Certificate Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Title</label>
              <p className="font-medium">{certificateData.title}</p>
            </div>
            {certificateData.description && (
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <div 
                  className="font-medium"
                  dangerouslySetInnerHTML={{ __html: certificateData.description }}
                />
              </div>
            )}
            {certificateData.courseTitle && (
              <div>
                <label className="text-sm text-gray-500">Course</label>
                <p className="font-medium">{certificateData.courseTitle}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className={`font-medium ${
                certificateData.isPublished ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {certificateData.isPublished ? 'Active' : 'Draft'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Created At</label>
              <p className="font-medium">
                {new Date(certificateData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}