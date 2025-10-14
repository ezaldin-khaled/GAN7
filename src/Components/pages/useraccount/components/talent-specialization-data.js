// Helper function to translate options
// Usage: getTranslatedOptions(options, translationKeyPrefix, t)
export const getTranslatedOptions = (options, translationKeyPrefix, t) => {
  return options.map(option => ({
    value: option.value, // Keep English for backend
    label: t(`${translationKeyPrefix}.${option.value}`) // Translate for display
  }));
};

export const TALENT_SPECIALIZATION_DATA = {
  visual_worker: {
    primary_categories: [
      { value: 'photographer', label: 'Photographer' },
      { value: 'cinematographer', label: 'Cinematographer' },
      { value: 'director', label: 'Director' },
      { value: 'editor', label: 'Video/Film Editor' },
      { value: 'animator', label: 'Animator' },
      { value: 'graphic_designer', label: 'Graphic Designer' },
      { value: 'makeup_artist', label: 'Makeup Artist' },
      { value: 'costume_designer', label: 'Costume Designer' },
      { value: 'set_designer', label: 'Set Designer' },
      { value: 'lighting_designer', label: 'Lighting Designer' },
      { value: 'visual_artist', label: 'Visual Artist' },
      { value: 'composer', label: 'Music Composer' },
      { value: 'sound_designer', label: 'Sound Designer' },
      { value: 'other', label: 'Other Visual Creator' }
    ],
    experience_levels: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'professional', label: 'Professional' },
      { value: 'expert', label: 'Expert' }
    ],
    availability_choices: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'weekends', label: 'Weekends Only' },
      { value: 'flexible', label: 'Flexible' }
    ],
    rate_ranges: [
      { value: 'low', label: 'Budget Friendly' },
      { value: 'mid', label: 'Mid-Range' },
      { value: 'high', label: 'Premium' },
      { value: 'negotiable', label: 'Negotiable' }
    ],
    fields: [
      { name: 'primary_category', type: 'select', required: true, default: 'photographer' },
      { name: 'years_experience', type: 'number', required: true, default: 0, min: 0 },
      { name: 'experience_level', type: 'select', required: true, default: 'beginner' },
      { name: 'portfolio_link', type: 'url', required: false },
      { name: 'availability', type: 'select', required: true, default: 'full_time' },
      { name: 'rate_range', type: 'select', required: true, default: 'low' },
      { name: 'willing_to_relocate', type: 'boolean', required: false, default: false }
    ]
  },

  expressive_worker: {
    performer_types: [
      { value: 'actor', label: 'Actor' },
      { value: 'comparse', label: 'Comparse' },
      { value: 'voice_actor', label: 'Voice Actor' },
      { value: 'singer', label: 'Singer' },
      { value: 'dancer', label: 'Dancer' },
      { value: 'musician', label: 'Musician' },
      { value: 'comedian', label: 'Comedian' },
      { value: 'host', label: 'TV/Event Host' },
      { value: 'narrator', label: 'Narrator' },
      { value: 'puppeteer', label: 'Puppeteer' },
      { value: 'other', label: 'Other Performer' }
    ],
    hair_colors: [
      { value: 'blonde', label: 'Blonde' },
      { value: 'brown', label: 'Brown' },
      { value: 'black', label: 'Black' },
      { value: 'red', label: 'Red' },
      { value: 'gray', label: 'Gray/Silver' },
      { value: 'other', label: 'Other' }
    ],
    hair_types: [
      { value: 'straight', label: 'Straight' },
      { value: 'wavy', label: 'Wavy' },
      { value: 'curly', label: 'Curly' },
      { value: 'coily', label: 'Coily' },
      { value: 'bald', label: 'Bald' },
      { value: 'other', label: 'Other' }
    ],
    skin_tones: [
      { value: 'fair', label: 'Fair' },
      { value: 'light', label: 'Light' },
      { value: 'medium', label: 'Medium' },
      { value: 'olive', label: 'Olive' },
      { value: 'brown', label: 'Brown' },
      { value: 'dark', label: 'Dark' }
    ],
    eye_colors: [
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' },
      { value: 'brown', label: 'Brown' },
      { value: 'hazel', label: 'Hazel' },
      { value: 'black', label: 'Black' },
      { value: 'other', label: 'Other' }
    ],
    eye_sizes: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ],
    eye_patterns: [
      { value: 'normal', label: 'Normal' },
      { value: 'protruding', label: 'Protruding' },
      { value: 'sunken', label: 'Sunken' },
      { value: 'almond', label: 'Almond' },
      { value: 'round', label: 'Round' },
      { value: 'other', label: 'Other' }
    ],
    face_shapes: [
      { value: 'oval', label: 'Oval' },
      { value: 'round', label: 'Round' },
      { value: 'square', label: 'Square' },
      { value: 'heart', label: 'Heart' },
      { value: 'diamond', label: 'Diamond' },
      { value: 'long', label: 'Long' },
      { value: 'other', label: 'Other' }
    ],
    forehead_shapes: [
      { value: 'broad', label: 'Broad' },
      { value: 'narrow', label: 'Narrow' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'straight', label: 'Straight' },
      { value: 'other', label: 'Other' }
    ],
    lip_shapes: [
      { value: 'thin', label: 'Thin' },
      { value: 'full', label: 'Full' },
      { value: 'heart', label: 'Heart-shaped' },
      { value: 'round', label: 'Round' },
      { value: 'bow', label: 'Cupid\'s Bow' },
      { value: 'other', label: 'Other' }
    ],
    eyebrow_patterns: [
      { value: 'arched', label: 'Arched' },
      { value: 'straight', label: 'Straight' },
      { value: 'curved', label: 'Curved' },
      { value: 'thick', label: 'Thick' },
      { value: 'thin', label: 'Thin' },
      { value: 'other', label: 'Other' }
    ],
    beard_lengths: [
      { value: 'none', label: 'None' },
      { value: 'stubble', label: 'Stubble' },
      { value: 'short', label: 'Short' },
      { value: 'medium', label: 'Medium' },
      { value: 'long', label: 'Long' },
      { value: 'other', label: 'Other' }
    ],
    distinctive_facial_marks: [
      { value: 'none', label: 'None' },
      { value: 'mole', label: 'Mole' },
      { value: 'scar', label: 'Scar' },
      { value: 'birthmark', label: 'Birthmark' },
      { value: 'freckles', label: 'Freckles' },
      { value: 'other', label: 'Other' }
    ],
    distinctive_body_marks: [
      { value: 'none', label: 'None' },
      { value: 'tattoo', label: 'Tattoo' },
      { value: 'scar', label: 'Scar' },
      { value: 'birthmark', label: 'Birthmark' },
      { value: 'other', label: 'Other' }
    ],
    voice_types: [
      { value: 'normal', label: 'Normal' },
      { value: 'thin', label: 'Thin' },
      { value: 'rough', label: 'Rough' },
      { value: 'deep', label: 'Deep' },
      { value: 'soft', label: 'Soft' },
      { value: 'nasal', label: 'Nasal' },
      { value: 'other', label: 'Other' }
    ],
    body_types: [
      { value: 'athletic', label: 'Athletic' },
      { value: 'slim', label: 'Slim' },
      { value: 'muscular', label: 'Muscular' },
      { value: 'average', label: 'Average' },
      { value: 'plus_size', label: 'Plus Size' },
      { value: 'other', label: 'Other' }
    ],
    availability_choices: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'evenings', label: 'Evenings Only' },
      { value: 'weekends', label: 'Weekends Only' }
    ],
    fields: [
      { name: 'performer_type', type: 'select', required: true, default: 'actor' },
      { name: 'years_experience', type: 'number', required: true, default: 0, min: 0 },
      { name: 'height', type: 'number', required: true, default: 0.0, min: 0, step: 0.1, unit: 'cm' },
      { name: 'weight', type: 'number', required: true, default: 0.0, min: 0, step: 0.1, unit: 'kg' },
      { name: 'hair_color', type: 'select', required: true, default: 'brown' },
      { name: 'eye_color', type: 'select', required: true, default: 'brown' },
      { name: 'body_type', type: 'select', required: true, default: 'average' },
      { name: 'availability', type: 'select', required: true, default: 'full_time' }
    ]
  },

  hybrid_worker: {
    hybrid_types: [
      { value: 'model', label: 'Fashion/Commercial Model' },
      { value: 'stunt_performer', label: 'Stunt Performer' },
      { value: 'body_double', label: 'Body Double' },
      { value: 'motion_capture', label: 'Motion Capture Artist' },
      { value: 'background_actor', label: 'Production Assets Actor' },
      { value: 'specialty_performer', label: 'Specialty Performer' },
      { value: 'other', label: 'Other Physical Performer' }
    ],
    hair_colors: [
      { value: 'blonde', label: 'Blonde' },
      { value: 'brown', label: 'Brown' },
      { value: 'black', label: 'Black' },
      { value: 'red', label: 'Red' },
      { value: 'gray', label: 'Gray/Silver' },
      { value: 'other', label: 'Other' }
    ],
    hair_types: [
      { value: 'straight', label: 'Straight' },
      { value: 'wavy', label: 'Wavy' },
      { value: 'curly', label: 'Curly' },
      { value: 'coily', label: 'Coily' },
      { value: 'bald', label: 'Bald' },
      { value: 'other', label: 'Other' }
    ],
    eye_colors: [
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' },
      { value: 'brown', label: 'Brown' },
      { value: 'hazel', label: 'Hazel' },
      { value: 'black', label: 'Black' },
      { value: 'other', label: 'Other' }
    ],
    eye_sizes: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ],
    eye_patterns: [
      { value: 'normal', label: 'Normal' },
      { value: 'protruding', label: 'Protruding' },
      { value: 'sunken', label: 'Sunken' },
      { value: 'almond', label: 'Almond' },
      { value: 'round', label: 'Round' },
      { value: 'other', label: 'Other' }
    ],
    face_shapes: [
      { value: 'oval', label: 'Oval' },
      { value: 'round', label: 'Round' },
      { value: 'square', label: 'Square' },
      { value: 'heart', label: 'Heart' },
      { value: 'diamond', label: 'Diamond' },
      { value: 'long', label: 'Long' },
      { value: 'other', label: 'Other' }
    ],
    forehead_shapes: [
      { value: 'broad', label: 'Broad' },
      { value: 'narrow', label: 'Narrow' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'straight', label: 'Straight' },
      { value: 'other', label: 'Other' }
    ],
    lip_shapes: [
      { value: 'thin', label: 'Thin' },
      { value: 'full', label: 'Full' },
      { value: 'heart', label: 'Heart-shaped' },
      { value: 'round', label: 'Round' },
      { value: 'bow', label: 'Cupid\'s Bow' },
      { value: 'other', label: 'Other' }
    ],
    eyebrow_patterns: [
      { value: 'arched', label: 'Arched' },
      { value: 'straight', label: 'Straight' },
      { value: 'curved', label: 'Curved' },
      { value: 'thick', label: 'Thick' },
      { value: 'thin', label: 'Thin' },
      { value: 'other', label: 'Other' }
    ],
    beard_lengths: [
      { value: 'none', label: 'None' },
      { value: 'stubble', label: 'Stubble' },
      { value: 'short', label: 'Short' },
      { value: 'medium', label: 'Medium' },
      { value: 'long', label: 'Long' },
      { value: 'other', label: 'Other' }
    ],
    distinctive_facial_marks: [
      { value: 'none', label: 'None' },
      { value: 'mole', label: 'Mole' },
      { value: 'scar', label: 'Scar' },
      { value: 'birthmark', label: 'Birthmark' },
      { value: 'freckles', label: 'Freckles' },
      { value: 'other', label: 'Other' }
    ],
    distinctive_body_marks: [
      { value: 'none', label: 'None' },
      { value: 'tattoo', label: 'Tattoo' },
      { value: 'scar', label: 'Scar' },
      { value: 'birthmark', label: 'Birthmark' },
      { value: 'other', label: 'Other' }
    ],
    voice_types: [
      { value: 'normal', label: 'Normal' },
      { value: 'thin', label: 'Thin' },
      { value: 'rough', label: 'Rough' },
      { value: 'deep', label: 'Deep' },
      { value: 'soft', label: 'Soft' },
      { value: 'nasal', label: 'Nasal' },
      { value: 'other', label: 'Other' }
    ],
    skin_tones: [
      { value: 'fair', label: 'Fair' },
      { value: 'light', label: 'Light' },
      { value: 'medium', label: 'Medium' },
      { value: 'olive', label: 'Olive' },
      { value: 'brown', label: 'Brown' },
      { value: 'dark', label: 'Dark' }
    ],
    body_types: [
      { value: 'athletic', label: 'Athletic' },
      { value: 'slim', label: 'Slim' },
      { value: 'muscular', label: 'Muscular' },
      { value: 'average', label: 'Average' },
      { value: 'plus_size', label: 'Plus Size' },
      { value: 'other', label: 'Other' }
    ],
    fitness_levels: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'elite', label: 'Elite Athlete' }
    ],
    risk_levels: [
      { value: 'low', label: 'Low Risk Only' },
      { value: 'moderate', label: 'Moderate Risk' },
      { value: 'high', label: 'High Risk' },
      { value: 'extreme', label: 'Extreme Stunts' }
    ],
    availability_choices: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'evenings', label: 'Evenings Only' },
      { value: 'weekends', label: 'Weekends Only' }
    ],
    fields: [
      { name: 'hybrid_type', type: 'select', required: true, default: 'model' },
      { name: 'years_experience', type: 'number', required: true, default: 0, min: 0 },
      { name: 'height', type: 'number', required: true, default: 0.0, min: 0, step: 0.1, unit: 'cm' },
      { name: 'weight', type: 'number', required: true, default: 0.0, min: 0, step: 0.1, unit: 'kg' },
      { name: 'hair_color', type: 'select', required: true, default: 'brown' },
      { name: 'eye_color', type: 'select', required: true, default: 'brown' },
      { name: 'skin_tone', type: 'select', required: true, default: 'fair' },
      { name: 'body_type', type: 'select', required: true, default: 'athletic' },
      { name: 'fitness_level', type: 'select', required: true, default: 'beginner' },
      { name: 'risk_levels', type: 'select', required: true, default: 'low' },
      { name: 'availability', type: 'select', required: true, default: 'full_time' },
      { name: 'willing_to_relocate', type: 'boolean', required: false, default: false }
    ]
  },

  common: {
    gender_choices: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ],
    account_types: [
      { value: 'platinum', label: 'Platinum' },
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
      { value: 'free', label: 'Free' }
    ]
  },

  test_video_requirements: {
    actor: {
      test_videos: 4,
      duration_seconds: 30,
      about_yourself_video: true,
      about_yourself_duration_seconds: 60
    },
    comparse: {
      test_videos: 4,
      duration_seconds: 30,
      about_yourself_video: true,
      about_yourself_duration_seconds: 60
    },
    host: {
      test_videos: 4,
      duration_seconds: 30,
      about_yourself_video: true,
      about_yourself_duration_seconds: 60
    },
    all_other_types: {
      test_videos: 0,
      about_yourself_video: true,
      about_yourself_duration_seconds: 60
    }
  }
};
