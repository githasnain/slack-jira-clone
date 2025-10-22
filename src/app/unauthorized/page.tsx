import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this resource.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
              <p className="font-medium mb-2">This page requires specific permissions:</p>
              <ul className="space-y-1">
                <li>• Administrator access for admin features</li>
                <li>• Valid user account for protected content</li>
                <li>• Proper authentication session</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
