/**
 * pictureSequences.js
 * Curated simple chronological stories for the Picture Sequencing activity.
 * Designed with clear, intuitive steps and universal, comforting themes.
 */

export const PICTURE_STORIES = [
  {
    id: 'story_plant_growth',
    title: 'Growing a Flower',
    description: 'Arrange how a flower grows from a tiny seed into a beautiful blossom.',
    steps: [
      {
        stepId: 'step_seed',
        order: 1,
        title: 'Planting the Seed',
        description: 'A tiny seed is gently placed into warm soil.',
        iconType: 'seed'
      },
      {
        stepId: 'step_sprout',
        order: 2,
        title: 'Sprout Appears',
        description: 'A delicate green sprout emerges toward the sun.',
        iconType: 'sprout'
      },
      {
        stepId: 'step_bud',
        order: 3,
        title: 'Flower Bud',
        description: 'A soft green flower bud forms, ready to open.',
        iconType: 'bud'
      },
      {
        stepId: 'step_bloom',
        order: 4,
        title: 'Full Bloom',
        description: 'A bright, fragrant flower opens fully in the sunshine.',
        iconType: 'bloom'
      }
    ]
  },
  {
    id: 'story_cup_of_tea',
    title: 'Making Warm Tea',
    description: 'Arrange the steps to make a comforting cup of tea.',
    steps: [
      {
        stepId: 'step_kettle',
        order: 1,
        title: 'Boiling Water',
        description: 'Clean fresh water warms in the kettle.',
        iconType: 'kettle'
      },
      {
        stepId: 'step_leaves',
        order: 2,
        title: 'Adding Tea Leaves',
        description: 'Fragrant fresh green tea leaves are gathered.',
        iconType: 'leaves'
      },
      {
        stepId: 'step_steep',
        order: 3,
        title: 'Steeping Tea',
        description: 'The golden tea steeps gently in warm water.',
        iconType: 'steep'
      },
      {
        stepId: 'step_enjoy',
        order: 4,
        title: 'Warm Cup of Tea',
        description: 'A comforting cup of fresh tea ready to enjoy.',
        iconType: 'cup'
      }
    ]
  }
];
