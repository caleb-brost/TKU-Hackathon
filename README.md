# TKU-Hackathon

Folder structure

  web/
  ├── app/
  │   ├── layout.tsx                        # Root layout + metadata
  │   ├── globals.css                       # Tailwind base
  │   ├── page.tsx                          # Main page (map + cards + route form)
  │   ├── tickets/[id]/page.tsx            # Ticket detail + completion form
  │   └── api/
  │       ├── tickets/route.ts             # GET /api/tickets
  │       ├── tickets/[id]/route.ts        # GET /api/tickets/[id]
  │       ├── tickets/[id]/complete/route.ts # PATCH /api/tickets/[id]/complete
  │       └── routes/generate/route.ts    # POST /api/routes/generate
  ├── components/
  │   ├── MapWidget.tsx                    # Google Maps (reused on both pages)
  │   ├── TicketCard.tsx                   # Card with select checkbox + navigate
  │   └── RouteForm.tsx                    # Address inputs + generate button
  ├── lib/
  │   ├── schemas.ts                       # All Zod schemas + derived types
  │   ├── supabase.ts                      # Browser + server Supabase clients
  │   └── api.ts                           # ok() / err() response helpers
  ├── services/
  │   ├── ticketService.ts                 # All DB access for Ticket
  │   └── routingService.ts               # Pluggable route generation
  └── supabase/
      ├── schema.sql                       # Create tables
      └── seed.sql                         # Sample tickets (Taipei)

  ---

  1. Run project

  cd web
  npm install
  npm run dev