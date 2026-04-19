"use client"

import React from 'react'
import { Contact, SocialLinks } from '../model/types'
import { motion } from 'framer-motion'
import { 
  User, 
  MapPin, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Instagram,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Briefcase
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ContactCardProps {
  contact: Contact
  netBalance: number
  onClick?: () => void
}

export function ContactCard({ contact, netBalance, onClick }: ContactCardProps) {
  const isOwed = netBalance > 0
  const owesUs = netBalance < 0
  const isNeutral = netBalance === 0

  const socialLinks = (contact.social_links as any) as SocialLinks || {}
  const hasSocials = Object.values(socialLinks).some(v => !!v)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-card border border-border/50 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center border border-border/50 shrink-0">
          {contact.photo_url ? (
            <img 
              src={contact.photo_url} 
              alt={contact.name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Header Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-display font-bold truncate group-hover:text-primary transition-colors">
            {contact.name}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest">
            {contact.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                {contact.city}
              </span>
            )}
            {contact.occupation && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-primary/40" />
                {contact.occupation}
              </span>
            )}
            {contact.groups && contact.groups.length > 0 && (
              <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                {contact.groups[0]}
              </span>
            )}
          </div>

          {/* Social Quick-Bar */}
          {hasSocials && (
            <div className="flex gap-1.5 mt-2.5">
              {socialLinks.instagram && <Instagram className="w-3 h-3 text-pink-500/60" />}
              {socialLinks.whatsapp && <MessageSquare className="w-3 h-3 text-green-500/60" />}
              {socialLinks.telegram && <Send className="w-3 h-3 text-blue-500/60" />}
              {socialLinks.phone && <Phone className="w-3 h-3 text-primary/60" />}
              {socialLinks.email && <Mail className="w-3 h-3 text-primary/60" />}
            </div>
          )}
        </div>
      </div>

      {/* Identity Layer (Personality) */}
      <div className="flex-grow">
          {contact.personality ? (
            <div className="flex flex-wrap gap-1.5">
              {contact.personality.split(',').map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-secondary/30 rounded-lg text-[9px] font-bold text-muted-foreground border border-border/20">
                  {tag.trim()}
                </span>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[30px] border border-dashed border-border/20 rounded-xl flex items-center justify-center">
               <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">No Persona Data</span>
            </div>
          )}
      </div>

      {/* Debt Summary Footer */}
      <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
        <div className={cn(
          "text-sm font-medium flex items-center gap-1.5",
          isOwed ? "text-green-500" : owesUs ? "text-red-500" : "text-muted-foreground"
        )}>
          {isNeutral ? (
            <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Position Neutral</span>
          ) : (
            <>
              {isOwed ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-display font-black text-lg">{Math.abs(netBalance).toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-tighter opacity-70 font-black">
                {isOwed ? "Receivable" : "Payable"}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
        </div>
      </div>
    </motion.div>
  )
}
