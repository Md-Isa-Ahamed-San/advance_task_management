'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { authClient } from '~/server/better-auth/client'

export function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: '/home',
      })
      if (signUpError) throw new Error(signUpError.message ?? 'Registration failed')
      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: '/home' })
    } catch {
      toast.error('Google sign-up failed')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <CheckSquare className="h-8 w-8" style={{ color: 'var(--primary-foreground)' }} />
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Create account</h1>
        <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Join TaskFlow and organize your tasks</p>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl border p-8"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-lg border px-4 py-3 text-sm"
              style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange}
                placeholder="John Doe" className="pl-10" required disabled={isLoading || isGoogleLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="pl-10" required disabled={isLoading || isGoogleLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange}
                placeholder="At least 8 characters" className="pl-10 pr-10"
                required disabled={isLoading || isGoogleLoading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}
                disabled={isLoading || isGoogleLoading}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <Input id="confirmPassword" name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="Repeat your password" className="pl-10 pr-10"
                required disabled={isLoading || isGoogleLoading} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}
                disabled={isLoading || isGoogleLoading}>
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
        </div>

        <Button type="button" variant="outline" className="mt-4 w-full gap-2"
          onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
        </Button>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
