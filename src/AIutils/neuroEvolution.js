import Board from "../GameLogic/Board";
import tf from "../tensorflow-init";

export function evolvePopulation(
  populationSize,
  savedBoards,
  rows,
  cols,
  mines
) {
  return tf.tidy(() => {
    // Evaluate fitness of each model
    calculateFitness(savedBoards);
    const fitnessScores = savedBoards.map((board) => board.fitness);

    // Select the top 50% of the population
    const sortedBoards = savedBoards
      .map((model, index) => ({ model, fitness: fitnessScores[index] }))
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, populationSize / 2)
      .map((item) => item.model);

    // Create new population through crossover and mutation
    const newBoards = [];
    while (newBoards.length < populationSize) {
      const parentA =
        sortedBoards[Math.floor(Math.random() * sortedBoards.length)];
      const parentB =
        sortedBoards[Math.floor(Math.random() * sortedBoards.length)];

      // Crossover (simple weight averaging)
      const child = new Board(rows, cols, mines);
      const parentAWeights = parentA.brain.model.getWeights();
      const parentBWeights = parentB.brain.model.getWeights();
      const childWeights = parentAWeights.map((weight, index) =>
        tf.add(
          tf.mul(weight, Math.random()),
          tf.mul(parentBWeights[index], 1 - Math.random())
        )
      );
      child.brain.model.setWeights(childWeights);

      // Mutation (small random changes to weights)
      const mutationRate = 0.1;
      const mutatedWeights = childWeights.map((weight) => {
        const shape = weight.shape;
        const values = weight.dataSync().slice();
        for (let i = 0; i < values.length; i++) {
          if (Math.random() < mutationRate) {
            values[i] += (Math.random() - 0.5) * 0.1;
          }
        }
        return tf.tensor(values, shape);
      });
      child.brain.model.setWeights(mutatedWeights);

      newBoards.push(child);
    }

    for (let i = 0; i < populationSize; i++) {
      savedBoards[i].brain.dispose();
    }
    savedBoards.length = 0;

    // console.log(tf.memory());

    return newBoards;
  });
}

function calculateFitness(savedBoards) {
  let sum = 0;
  for (let board of savedBoards) {
    sum += board.fitness;
  }
  for (let board of savedBoards) {
    board.fitness = board.fitness / sum;
  }
}
