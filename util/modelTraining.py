import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import tensorflow as tf

def plot_training_history(history):
    plt.figure(figsize=(12, 6))
    plt.plot(history.history['loss'], label='Train Loss')
    if 'val_loss' in history.history:
        plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.title('Model Training Loss')
    plt.legend()
    plt.grid(True)
    plt.show()

def plot_predictions(true, predicted, title='Model Predictions vs True Values'):
    plt.figure(figsize=(12,6))
    plt.plot(true, label='True')
    plt.plot(predicted, label='Predicted')
    plt.title(title)
    plt.xlabel('Time Step')
    plt.ylabel('Value')
    plt.legend()
    plt.grid(True)
    plt.show()

def evaluate_regression_metrics(true, predicted):
    mse = mean_squared_error(true, predicted)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(true, predicted)
    r2 = r2_score(true, predicted)
    return {
        'MSE': mse,
        'RMSE': rmse,
        'MAE': mae,
        'R2': r2,
    }

def early_stopping_callback(patience=5, min_delta=0):
    from tensorflow.keras.callbacks import EarlyStopping
    return EarlyStopping(monitor='val_loss', patience=patience, min_delta=min_delta, restore_best_weights=True)

def save_model(model, path):
    model.save(path)

def load_model(path):
    from tensorflow.keras.models import load_model
    return load_model(path)

def learning_rate_scheduler_callback(schedule_func):
    """
    Returns a Keras LearningRateScheduler callback.
    schedule_func: function(epoch, lr) -> new_lr
    """
    from tensorflow.keras.callbacks import LearningRateScheduler
    return LearningRateScheduler(schedule_func)

def plot_learning_rate(history):
    """
    Plot learning rate vs epoch if recorded.
    Requires a custom callback to log LR or manual logging.
    """
    lrs = history.history.get('lr')
    if lrs is None:
        print("Learning rate history not found in the history object.")
        return
    plt.figure(figsize=(10, 4))
    plt.plot(lrs)
    plt.xlabel('Epoch')
    plt.ylabel('Learning Rate')
    plt.title('Learning Rate Schedule')
    plt.grid(True)
    plt.show()

def get_model_summary_as_string(model):
    """
    Returns model summary as a string.
    """
    import io
    stream = io.StringIO()
    model.summary(print_fn=lambda x: stream.write(x + '\n'))
    summary_str = stream.getvalue()
    stream.close()
    return summary_str

def gradient_exploding_check(gradients, threshold=1e2):
    """
    Check if any gradient exceeds threshold magnitude.
    gradients: list of gradients (tensors or numpy arrays)
    Returns True if exploding gradients detected.
    """
    for g in gradients:
        if g is not None:
            norm = tf.norm(g).numpy()
            if norm > threshold:
                return True
    return False

def plot_residuals(true, predicted):
    """
    Plot residual errors over time.
    """
    residuals = true - predicted
    plt.figure(figsize=(12, 6))
    plt.plot(residuals, label='Residuals')
    plt.hlines(0, xmin=0, xmax=len(residuals), colors='r', linestyles='dashed')
    plt.title('Residual Errors')
    plt.xlabel('Time Step')
    plt.ylabel('Residual')
    plt.legend()
    plt.grid(True)
    plt.show()
