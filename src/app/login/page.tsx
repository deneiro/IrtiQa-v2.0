"use client"
import React, { useState } from 'react'
import { createClient } from '@/shared/api/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Flame } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }
    
    // Page will reload correctly because of middleware
    window.location.href = '/'
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      alert(error.message)
    } else {
      alert("Account generated! If you have disabled email confirmation in your dashboard, you can now Login immediately.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-6">
      {/* Dev Tip */}
      <div className="w-full max-w-sm p-4 rounded-lg bg-attribute-brightness/10 border border-attribute-brightness/30 text-xs text-attribute-brightness">
        <strong>Dev Tip:</strong> To skip confirmation emails, go to <strong>Auth {"->"} Settings</strong> in your Supabase Dashboard and toggle off <strong>"Confirm email"</strong>.
      </div>

      <Card className="w-full max-w-sm border-attribute-spirituality/50 shadow-xl shadow-attribute-spirituality/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Flame className="w-12 h-12 text-attribute-friends animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-display">Irtiqa</CardTitle>
          <CardDescription>Enter your credentials to sync your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-attribute-spirituality focus:outline-none placeholder:text-muted-foreground/50 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-attribute-spirituality focus:outline-none placeholder:text-muted-foreground/50 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button type="button" variant="outline" onClick={handleSignUp} disabled={loading}>
                Sign Up
              </Button>
              <Button type="submit" className="bg-attribute-spirituality hover:bg-attribute-spirituality/80 text-white font-medium" disabled={loading}>
                {loading ? 'Entering...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
