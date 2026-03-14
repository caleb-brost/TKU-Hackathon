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




# Citations
@inproceedings{arya2022crowdsensing,
  title={Crowdsensing-based Road Damage Detection Challenge (CRDDC’2022)},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Omata, Hiroshi and Kashiyama, Takehiro and Sekimoto, Yoshihide},
  booktitle={2022 IEEE International Conference on Big Data (Big Data)},
  pages={6378--6386},
  year={2022},
  organization={IEEE}
}

@article{arya2022rdd2022,
  title={RDD2022: A multi-national image dataset for automatic Road Damage Detection},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Sekimoto, Yoshihide},
  journal={arXiv preprint arXiv:2209.08538},
  year={2022}
}

@article{arya2021deep,
  title={Deep learning-based road damage detection and classification for multiple countries},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Mraz, Alexander and Kashiyama, Takehiro and Sekimoto, Yoshihide},
  journal={Automation in Construction},
  volume={132},
  pages={103935},
  year={2021},
  publisher={Elsevier}
}

@article{arya2021rdd2020,
  title={RDD2020: An annotated image dataset for automatic road damage detection using deep learning},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Sekimoto, Yoshihide},
  journal={Data in brief},
  volume={36},
  pages={107133},
  year={2021},
  publisher={Elsevier}

@inproceedings{arya2020global,
  title={Global road damage detection: State-of-the-art solutions},
  author={Arya, Deeksha and Maeda, Hiroya and Ghosh, Sanjay Kumar and Toshniwal, Durga and Omata, Hiroshi and Kashiyama, Takehiro and Sekimoto, Yoshihide},
  booktitle={2020 IEEE International Conference on Big Data (Big Data)},
  pages={5533--5539},
  year={2020},
  organization={IEEE}
}