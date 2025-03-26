import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  BackHandler,
} from 'react-native';

// -----------------
// Type Definitions
// -----------------
type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};

type QuizResult = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

// -----------------
// Sample Data
// -----------------
const quizzes: Quiz[] = [
  {
    id: 'quiz1',
    title: 'General Knowledge',
    questions: [
      {
        question: 'What is the capital of France?',
        options: ['Berlin', 'London', 'Paris', 'Rome'],
        correctIndex: 2,
      },
      {
        question: 'Who wrote "Hamlet"?',
        options: [
          'Charles Dickens',
          'William Shakespeare',
          'Mark Twain',
          'J.K. Rowling',
        ],
        correctIndex: 1,
      },
      {
        question: 'What is the largest ocean?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctIndex: 3,
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correctIndex: 1,
      },
      {
        question: 'What language is primarily spoken in Brazil?',
        options: ['Spanish', 'Portuguese', 'English', 'French'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'quiz2',
    title: 'Technology',
    questions: [
      {
        question: 'What does HTTP stand for?',
        options: [
          'HyperText Transfer Protocol',
          'HighText Transfer Protocol',
          'HyperText Transmission Protocol',
          'HyperTransfer Text Protocol',
        ],
        correctIndex: 0,
      },
      {
        question: 'Which company developed the React library?',
        options: ['Google', 'Facebook', 'Microsoft', 'Apple'],
        correctIndex: 1,
      },
      {
        question: 'What does CPU stand for?',
        options: [
          'Central Processing Unit',
          'Central Process Unit',
          'Computer Personal Unit',
          'Central Peripheral Unit',
        ],
        correctIndex: 0,
      },
      {
        question: 'Which language is used for web apps?',
        options: ['Python', 'JavaScript', 'C++', 'Java'],
        correctIndex: 1,
      },
      {
        question: 'What is the name of the mobile OS developed by Google?',
        options: ['iOS', 'Android', 'Windows Phone', 'Blackberry OS'],
        correctIndex: 1,
      },
    ],
  },
];

// -----------------
// Main Component
// -----------------
export default function HomeScreen() {
  // Define state with proper type annotations
  const [currentScreen, setCurrentScreen] = useState<'QuizList' | 'Quiz' | 'Result'>('QuizList');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState<boolean>(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [resultSummary, setResultSummary] = useState<QuizResult[]>([]);

  // Disable Android back button once a quiz starts (Bonus requirement)
  useEffect(() => {
    if (currentScreen === 'Quiz') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [currentScreen]);

  // Reset state when starting a new quiz
  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setAnswerChecked(false);
    setScore({ correct: 0, incorrect: 0 });
    setResultSummary([]);
    setCurrentScreen('Quiz');
  };

  // Handle option selection
  const handleOptionSelect = (index: number) => {
    if (!answerChecked) {
      setSelectedOptionIndex(index);
    }
  };

  // Check answer and update result summary
  const checkAnswer = () => {
    if (selectedOptionIndex === null || !selectedQuiz) return;
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
    setResultSummary((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: currentQuestion.options[selectedOptionIndex],
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        isCorrect,
      },
    ]);
    setAnswerChecked(true);
  };

  // Proceed to next question or show result screen if finished
  const nextQuestion = () => {
    if (!selectedQuiz) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < selectedQuiz.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOptionIndex(null);
      setAnswerChecked(false);
    } else {
      setCurrentScreen('Result');
    }
  };

  // Render the quiz list screen
  const renderQuizList = () => {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Select a Quiz</Text>
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quizItem} onPress={() => startQuiz(item)}>
              <Text style={styles.quizTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  };

  // Render the quiz question screen
  const renderQuizScreen = () => {
    if (!selectedQuiz) return null;
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
        </Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        {currentQuestion.options.map((option: string, index: number) => {
          // Determine option styling based on selection and answer check
          let optionStyle = styles.optionButton;
          let optionTextStyle = styles.optionText;
          if (selectedOptionIndex === index) {
            optionStyle = { ...optionStyle, ...styles.selectedOption };
          }
          if (answerChecked) {
            if (index === currentQuestion.correctIndex) {
              // correct answer highlighted in green
              optionStyle = { ...optionStyle, ...styles.correctOption };
            } else if (index === selectedOptionIndex && index !== currentQuestion.correctIndex) {
              // incorrect answer highlighted in red
              optionStyle = { ...optionStyle, ...styles.incorrectOption };
            }
          }
          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleOptionSelect(index)}
              disabled={answerChecked}
            >
              <Text style={optionTextStyle}>{option}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.buttonContainer}>
          {answerChecked ? (
            <TouchableOpacity style={styles.actionButton} onPress={nextQuestion}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: selectedOptionIndex === null ? '#ccc' : '#007AFF' },
              ]}
              onPress={checkAnswer}
              disabled={selectedOptionIndex === null}
            >
              <Text style={styles.buttonText}>Check Your Answer</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  };

  // Render the result screen with a summary
  const renderResultScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Quiz Result</Text>
        <Text style={styles.score}>
          Correct: {score.correct} | Incorrect: {score.incorrect}
        </Text>
        <FlatList
          data={resultSummary}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryQuestion}>
                {index + 1}. {item.question}
              </Text>
              <Text style={styles.summaryAnswer}>
                Your Answer: {item.userAnswer} {item.isCorrect ? '✓' : '✗'}
              </Text>
              {!item.isCorrect && (
                <Text style={styles.summaryAnswer}>
                  Correct Answer: {item.correctAnswer}
                </Text>
              )}
            </View>
          )}
        />
        <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('QuizList')}>
          <Text style={styles.buttonText}>Back to Quiz List</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  // Main render switch
  return (
    <>
      {currentScreen === 'QuizList' && renderQuizList()}
      {currentScreen === 'Quiz' && renderQuizScreen()}
      {currentScreen === 'Result' && renderResultScreen()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quizItem: {
    padding: 16,
    backgroundColor: '#007AFF',
    marginVertical: 8,
    borderRadius: 8,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 18,
  },
  progress: {
    fontSize: 16,
    marginBottom: 8,
  },
  question: {
    fontSize: 20,
    marginBottom: 16,
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginVertical: 6,
  },
  selectedOption: {
    backgroundColor: '#e0f0ff',
  },
  correctOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  incorrectOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  optionText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  score: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 12,
  },
  summaryItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 6,
  },
  summaryQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryAnswer: {
    fontSize: 15,
    marginTop: 4,
  },
});
