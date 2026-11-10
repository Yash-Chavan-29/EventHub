const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-events';

const seedData = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully for seeding...');

    // 2. Find or Create an Organizer Account
    let organizer = await User.findOne({ role: 'organizer' });
    if (!organizer) {
      console.log('No organizer found. Creating a default organizer account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('organizer123', salt);
      organizer = await User.create({
        name: 'Prof. Rajesh Kumar (Event Coordinator)',
        email: 'organizer@kletech.ac.in',
        password: hashedPassword,
        role: 'organizer',
      });
      console.log('Created Organizer account: organizer@kletech.ac.in / organizer123');
    }

    // 3. Clear Existing Events (Optional but helpful to start clean)
    await Event.deleteMany({});
    console.log('Cleared existing events...');

    // 4. Pre-installed Events List (all after 09/06/2026)
    const events = [
      // CATEGORY: TECHNICAL
      {
        title: 'National Mega Hackathon 2026',
        description: 'A 36-hour coding marathon where developers, designers, and entrepreneurs collaborate to solve real-world problems using AI, blockchain, and cloud computing. Exciting cash prizes and internship offers for winners!',
        date: new Date('2026-06-12T10:00:00.000Z'),
        time: '09:00 AM - 09:00 PM (Next Day)',
        venue: 'Aryabhatta Seminar Hall, Main Block',
        category: 'technical',
        organizer: organizer._id,
        capacity: 150,
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'RoboQuest Championship',
        description: 'Prepare your autonomous and manual robots to compete in the ultimate grid obstacle course and Robo-war arena. Bring out your engineering skills and claim the champion cup!',
        date: new Date('2026-06-20T09:30:00.000Z'),
        time: '09:30 AM - 04:30 PM',
        venue: 'Mechanical Engineering Workshop',
        category: 'technical',
        organizer: organizer._id,
        capacity: 80,
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'AI & Web3 Synergy Symposium',
        description: 'Explore the fusion of generative AI and decentralized systems. Meet industry leaders from tech conglomerates and watch hands-on demonstrations of prompt engineering and smart contract auditing.',
        date: new Date('2026-07-02T11:00:00.000Z'),
        time: '11:00 AM - 03:00 PM',
        venue: 'Senate Hall, PG Block',
        category: 'technical',
        organizer: organizer._id,
        capacity: 120,
        image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },

      // CATEGORY: CULTURAL
      {
        title: 'Spandan 2026: Annual Fusion Fest',
        description: 'Celebrate cultural harmony with Spandan, the flagship annual talent hub. Experience classical dances, high-octane rock band face-offs, fashion parades, and authentic local drama.',
        date: new Date('2026-06-15T16:00:00.000Z'),
        time: '04:00 PM - 10:00 PM',
        venue: 'Open Air Amphitheatre',
        category: 'cultural',
        organizer: organizer._id,
        capacity: 500,
        image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'VibeCheck: Inter-College Battle of Bands',
        description: 'A platform where the best acoustic, rock, and metal bands from across the state battle it out live. Feel the heavy bass, soaring vocals, and incredible campus energy!',
        date: new Date('2026-06-28T17:00:00.000Z'),
        time: '05:00 PM - 09:30 PM',
        venue: 'Main Campus Quadrangle',
        category: 'cultural',
        organizer: organizer._id,
        capacity: 350,
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Melange Classical Singing Face-Off',
        description: 'Witness the serene, soulful renditions of Hindustani and Carnatic classical vocals in this highly anticipated annual championship. Expert vocalists judge technical accuracy and performance.',
        date: new Date('2026-07-10T14:00:00.000Z'),
        time: '02:00 PM - 06:00 PM',
        venue: 'LH-04 Seminar Room, Architecture Block',
        category: 'cultural',
        organizer: organizer._id,
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },

      // CATEGORY: SPORTS
      {
        title: 'Synergy Inter-Department Cricket Tournament',
        description: 'The ultimate cricket tournament where departments battle on the pitch. Gear up for boundary action, tactical bowling, and intense team support under the sun. Standard T20 format.',
        date: new Date('2026-06-18T08:00:00.000Z'),
        time: '08:00 AM - 05:00 PM',
        venue: 'Sports Ground Alpha',
        category: 'sports',
        organizer: organizer._id,
        capacity: 200,
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Championship Smash: Badminton Open',
        description: 'Singles and Doubles Badminton Tournament open to all branches. Showcase your lightning-fast reflex drops, smashes, and court coverage to take home the gold and silver medals.',
        date: new Date('2026-06-25T09:00:00.000Z'),
        time: '09:00 AM - 04:00 PM',
        venue: 'Indoor Gymnasium Hall 1',
        category: 'sports',
        organizer: organizer._id,
        capacity: 64,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Midnight Blitz: Speed Chess Arena',
        description: 'Rapid 3+2 speed chess tournament under professional arbiters. Think fast, move faster, and do not let your clock run out. Cash prizes for top three grandmasters.',
        date: new Date('2026-07-06T18:00:00.000Z'),
        time: '06:00 PM - 09:30 PM',
        venue: 'Student Activity Lounge',
        category: 'sports',
        organizer: organizer._id,
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },

      // CATEGORY: SEMINAR
      {
        title: 'Global Tech Trends 2026 and Beyond',
        description: 'A stellar guest keynote lecture by distinguished alumni and VP of Engineering at Google, focusing on full-stack microservices, edge computations, and the ethical parameters of AI integrations.',
        date: new Date('2026-06-14T10:30:00.000Z'),
        time: '10:30 AM - 01:00 PM',
        venue: 'Bhabha Seminar Auditorium',
        category: 'seminar',
        organizer: organizer._id,
        capacity: 300,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Masterclass: Placement Hacks & Interview Prep',
        description: 'Crucial guidance seminar for final-year students: Resume building, technical test cracking, body language training, and navigating mock interviews with actual corporate HR recruiters.',
        date: new Date('2026-06-22T14:00:00.000Z'),
        time: '02:00 PM - 05:00 PM',
        venue: 'Placement Cell Seminar Hall',
        category: 'seminar',
        organizer: organizer._id,
        capacity: 250,
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Panel Discussion on Entrepreneurship and VC Funding',
        description: 'Fireside chat with founders of top local startups and venture capitalists. Ask questions, pitch your ideas, and learn how to secure early-stage pre-seed funding for your campus projects.',
        date: new Date('2026-07-08T11:00:00.000Z'),
        time: '11:00 AM - 01:30 PM',
        venue: 'Senate Hall, PG Block',
        category: 'seminar',
        organizer: organizer._id,
        capacity: 150,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },

      // CATEGORY: OTHER
      {
        title: 'Youth Red Cross blood Donation Camp',
        description: 'Donate blood, save lives. Organized in association with the City Civil Hospital. All donors will receive official participation certificates, badges, and nutritional refreshments.',
        date: new Date('2026-06-16T09:00:00.000Z'),
        time: '09:00 AM - 03:00 PM',
        venue: 'College Gymnasium Foyer',
        category: 'other',
        organizer: organizer._id,
        capacity: 300,
        image: 'https://images.unsplash.com/photo-1615461066841-6116ecdccd04?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Green Campus: Tree Plantation Drive',
        description: 'Join the college environment club to plant 500 saplings around the new block. Bring your tools, wear comfortable sports shoes, and help establish a sustainable local ecosystem.',
        date: new Date('2026-06-27T08:30:00.000Z'),
        time: '08:30 AM - 12:00 PM',
        venue: 'North Extension Garden Area',
        category: 'other',
        organizer: organizer._id,
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
      {
        title: 'Book Donation & Literary Exchange Fair',
        description: 'Bring old semester textbooks, fiction works, or technical references and exchange them with fellow students. Keep library circles open and discover your next great read!',
        date: new Date('2026-07-12T10:00:00.000Z'),
        time: '10:00 AM - 04:00 PM',
        venue: 'Central Library Lounge',
        category: 'other',
        organizer: organizer._id,
        capacity: 150,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60',
        status: 'upcoming',
      },
    ];

    // 5. Insert events
    await Event.insertMany(events);
    console.log(`Successfully seeded ${events.length} college events across all 5 categories!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
