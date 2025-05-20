import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizBuilder = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: 'What does HTML stand for?',
      type: 'multipleChoice',
      options: [
        { id: 1, text: 'Hypertext Markup Language', selected: false },
        { id: 2, text: 'High-level Text Management Language', selected: false },
        { id: 3, text: 'Hyperlink and Text Markup Language', selected: false },
        { id: 4, text: 'Home Tool Markup Language', selected: false },
      ]
    }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [mode, setMode] = useState('preview'); // 'preview' or 'edit'
  const [quizTitle, setQuizTitle] = useState('New Quiz');

  const handleOptionSelect = (questionId, optionId) => {
    setQuestions(questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          options: question.options.map(option => ({
            ...option,
            selected: option.id === optionId
          }))
        };
      }
      return question;
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      text: 'Enter your question here',
      type: 'multipleChoice',
      options: [
        { id: 1, text: 'Option 1', selected: false },
        { id: 2, text: 'Option 2', selected: false },
        { id: 3, text: 'Option 3', selected: false },
        { id: 4, text: 'Option 4', selected: false },
      ]
    };
    
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion(newQuestion.id);
    setMode('edit');
  };

  const handleAddOption = (questionId) => {
    setQuestions(questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          options: [
            ...question.options,
            { id: question.options.length + 1, text: 'New option', selected: false }
          ]
        };
      }
      return question;
    }));
  };

  const handleSave = () => {
    console.log('Saving quiz:', { title: quizTitle, questions });
    // In a real app, you would save to a database here
    alert('Quiz saved successfully!');
    navigate('/');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard this quiz?')) {
      navigate('/');
    }
  };

  const handleUpdateQuestionText = (questionId, newText) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {...q, text: newText} : q
    ));
  };

  const handleUpdateOptionText = (questionId, optionId, newText) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? {...o, text: newText} : o
          )
        };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionId, optionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const updatedOptions = q.options.filter(o => o.id !== optionId);
        return {
          ...q,
          options: updatedOptions
        };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (questionId) => {
    if (questions.length <= 1) {
      alert('You cannot delete the only question.');
      return;
    }
    
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    
    if (currentQuestion === questionId) {
      setCurrentQuestion(updatedQuestions[0].id);
    }
  };

  const renderQuestionsList = () => {
    return (
      <div className="questions-list">
        <h3>Questions</h3>
        <div className="questions-container">
          {questions.map((q, index) => (
            <button 
              key={q.id}
              className={`question-tab ${currentQuestion === q.id ? 'active' : ''}`}
              onClick={() => setCurrentQuestion(q.id)}
            >
              <span className="question-number">{index + 1}</span>
              <span className="question-preview">
                {q.text.length > 25 ? q.text.substring(0, 25) + '...' : q.text}
              </span>
            </button>
          ))}
          <button className="add-question-btn" onClick={handleAddQuestion}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Add Question</span>
          </button>
        </div>
      </div>
    );
  };

  const renderPreviewMode = () => {
    const currentQ = questions.find(q => q.id === currentQuestion) || questions[0];
    
    return (
      <div className="quiz-preview-mode">
        <div className="question-container">
          <h2>{currentQ.text}</h2>
          
          <div className="options-list">
            {currentQ.options.map(option => (
              <div className="option-item" key={option.id}>
                <input
                  type="radio"
                  id={`option-${option.id}`}
                  name={`question-${currentQ.id}`}
                  checked={option.selected}
                  onChange={() => handleOptionSelect(currentQ.id, option.id)}
                />
                <label htmlFor={`option-${option.id}`}>{option.text}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="question-action-bar">
          <button className="btn btn-outline" onClick={() => setMode('edit')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit
          </button>
          <div className="question-navigation">
            <button 
              className="btn btn-icon" 
              disabled={currentQuestion === questions[0].id}
              onClick={() => {
                const index = questions.findIndex(q => q.id === currentQuestion);
                if (index > 0) setCurrentQuestion(questions[index - 1].id);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="question-indicator">
              {questions.findIndex(q => q.id === currentQuestion) + 1} / {questions.length}
            </span>
            <button 
              className="btn btn-icon"
              disabled={currentQuestion === questions[questions.length - 1].id}
              onClick={() => {
                const index = questions.findIndex(q => q.id === currentQuestion);
                if (index < questions.length - 1) setCurrentQuestion(questions[index + 1].id);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditMode = () => {
    const currentQ = questions.find(q => q.id === currentQuestion) || questions[0];
    
    return (
      <div className="quiz-edit-mode">
        <div className="question-editor">
          <div className="input-group">
            <label htmlFor="questionText">Question</label>
            <input 
              type="text" 
              id="questionText"
              className="question-input" 
              value={currentQ.text}
              onChange={(e) => handleUpdateQuestionText(currentQ.id, e.target.value)}
              placeholder="Enter your question here"
            />
          </div>
          
          <div className="options-type">
            <label>Multiple Choice</label>
            
            <div className="options-list-editor">
              {currentQ.options.map((option) => (
                <div className="option-editor" key={option.id}>
                  <div className="option-radio">
                    <input
                      type="radio"
                      checked={option.selected}
                      onChange={() => handleOptionSelect(currentQ.id, option.id)}
                    />
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleUpdateOptionText(currentQ.id, option.id, e.target.value)}
                    placeholder="Option text"
                  />
                  {currentQ.options.length > 2 && (
                    <button 
                      className="delete-option-btn"
                      onClick={() => handleDeleteOption(currentQ.id, option.id)}
                      title="Delete option"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              <button className="add-option-btn" onClick={() => handleAddOption(currentQ.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add option
              </button>
            </div>
          </div>
        </div>
        
        <div className="question-action-bar">
          <button 
            className="btn btn-outline delete-question-btn"
            onClick={() => handleDeleteQuestion(currentQ.id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete
          </button>
          <button className="btn btn-primary" onClick={() => setMode('preview')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Preview
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="quiz-builder-container">
      <div className="quiz-builder-card">
        <div className="quiz-builder-header">
          <div className="quiz-title-section">
            <h1>
              {mode === 'edit' ? (
                <input 
                  type="text" 
                  value={quizTitle} 
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="quiz-title-input"
                  placeholder="Quiz Title"
                />
              ) : (
                quizTitle
              )}
            </h1>
          </div>
          
          <div className="builder-actions">
            <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Quiz</button>
          </div>
        </div>
        
        <div className="quiz-builder-content">
          <div className="quiz-sidebar">
            {renderQuestionsList()}
          </div>
          
          <div className="quiz-main-content">
            {mode === 'preview' ? renderPreviewMode() : renderEditMode()}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .quiz-builder-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .quiz-builder-card {
          background: var(--white);
          border-radius: 12px;
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }
        
        .quiz-builder-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .quiz-title-section h1 {
          font-size: 20px;
          font-weight: var(--font-semibold);
          margin: 0;
          color: var(--dark);
        }
        
        .quiz-title-input {
          font-size: 20px;
          font-weight: var(--font-semibold);
          border: none;
          border-bottom: 1px solid var(--border);
          padding: 4px 0;
          background: transparent;
          color: var(--dark);
          width: 250px;
        }
        
        .quiz-title-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .builder-actions {
          display: flex;
          gap: 12px;
        }
        
        .quiz-builder-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 500px;
        }
        
        .quiz-sidebar {
          padding: 24px;
          border-right: 1px solid var(--border);
          background: var(--secondary);
        }
        
        .questions-list h3 {
          font-size: 16px;
          font-weight: var(--font-medium);
          margin: 0 0 16px 0;
          color: var(--dark);
        }
        
        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .question-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 6px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .question-tab:hover {
          background: var(--secondary-hover);
        }
        
        .question-tab.active {
          border-color: var(--primary);
          background: rgba(79, 70, 229, 0.05);
        }
        
        .question-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--secondary);
          border-radius: 4px;
          font-size: 12px;
          font-weight: var(--font-medium);
          color: var(--text);
        }
        
        .question-tab.active .question-number {
          background: var(--primary);
          color: white;
        }
        
        .question-preview {
          font-size: 14px;
          color: var(--text);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .add-question-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--secondary-hover);
          border: 1px dashed var(--border);
          border-radius: 6px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }
        
        .add-question-btn:hover {
          background: var(--secondary);
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .quiz-main-content {
          padding: 24px;
        }
        
        /* Preview Mode Styles */
        .quiz-preview-mode {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .question-container {
          margin-bottom: 32px;
        }
        
        .question-container h2 {
          font-size: 18px;
          font-weight: var(--font-medium);
          margin: 0 0 20px 0;
          color: var(--dark);
        }
        
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .option-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--secondary);
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        
        .option-item:hover {
          background: var(--secondary-hover);
        }
        
        .option-item input[type="radio"] {
          width: 20px;
          height: 20px;
          accent-color: var(--primary);
          cursor: pointer;
        }
        
        .option-item label {
          font-size: 16px;
          color: var(--dark);
          cursor: pointer;
          margin: 0;
        }
        
        .question-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        
        .question-navigation {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .question-indicator {
          font-size: 14px;
          color: var(--text);
        }
        
        /* Edit Mode Styles */
        .quiz-edit-mode {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .question-editor {
          margin-bottom: 24px;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .question-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 16px;
        }
        
        .options-type {
          margin-top: 24px;
        }
        
        .options-list-editor {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        
        .option-editor {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .option-radio {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .option-radio input[type="radio"] {
          width: 20px;
          height: 20px;
          accent-color: var(--primary);
        }
        
        .option-editor input[type="text"] {
          flex: 1;
          padding: 10px 12px;
          font-size: 14px;
        }
        
        .delete-option-btn {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 6px;
          transition: color 0.2s;
        }
        
        .delete-option-btn:hover {
          color: var(--error);
        }
        
        .add-option-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--primary);
          padding: 10px 0;
          font-size: 14px;
          cursor: pointer;
          margin-top: 8px;
        }
        
        .delete-question-btn {
          color: var(--error);
          border-color: var(--error);
        }
        
        .delete-question-btn:hover {
          background: rgba(239, 68, 68, 0.05);
        }
        
        @media (max-width: 768px) {
          .quiz-builder-content {
            grid-template-columns: 1fr;
          }
          
          .quiz-sidebar {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 20px 24px;
          }
          
          .quiz-builder-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .builder-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizBuilder; 