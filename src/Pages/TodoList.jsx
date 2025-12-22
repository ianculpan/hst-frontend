import { useState } from 'react';
import { usePaginatedData } from '../helpers/usePaginatedData.js';
import TodoCard from '../components/TodoCard.jsx';
import { useModal } from '../components/modals/ModalContext.jsx';
import TodoCreate from '../components/modals/crud/todo/TodoCreate.jsx';
import TodoFilters from '../components/TodoFilters.jsx';

const TodoList = () => {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    exclude_closed: '1',
    priority_order: 'asc',
  });
  const [showClosed, setShowClosed] = useState(false);
  const [priorityOrder, setPriorityOrder] = useState('asc');

  const {
    data: responseData,
    pagination,
    isLoading,
    errorMessage,
    handlePageChange,
    refetch,
  } = usePaginatedData('/todos', filters, [
    filters.status,
    filters.category,
    filters.priority,
    filters.exclude_closed,
    filters.priority_order,
  ]);

  const { openModal } = useModal();
  const { closeModal } = useModal();

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      exclude_closed: '1',
      priority_order: 'asc',
    });
  };

  const toggleClosed = () => {
    const newShowClosed = !showClosed;
    setShowClosed(newShowClosed);
    setFilters((prev) => ({ ...prev, exclude_closed: newShowClosed ? '' : '1' }));
  };

  const togglePriorityOrder = () => {
    const newOrder = priorityOrder === 'asc' ? 'desc' : 'asc';
    setPriorityOrder(newOrder);
    setFilters((prev) => ({ ...prev, priority_order: newOrder }));
  };

  const handleTodoUpdate = () => {
    refetch();
  };

  const handleTodoCreate = () => {
    refetch();
  };

  return (
    <div className="">
      <section className="panel rounded-lg py-4 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="panel-title p-4 text-3xl text-center">Todo List</h1>
          <div className="flex items-center gap-2 pr-2">
            <TodoFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              showClosed={showClosed}
              onToggleClosed={toggleClosed}
              priorityOrder={priorityOrder}
              onTogglePriorityOrder={togglePriorityOrder}
            />
            <button
              className="px-4 bg-highlight-background text-highlight-foreground rounded-lg hover:bg-highlight-hover transition-colors"
              onClick={() =>
                openModal(<TodoCreate closeModal={closeModal} onUpdate={handleTodoCreate} />)
              }
            >
              Add New
            </button>
          </div>
        </div>

        <div className="px-4 pt-4">
          {isLoading && <div className="text-theme-100">Loading...</div>}
          {!isLoading && errorMessage && <div className="text-red-300">Error: {errorMessage}</div>}
          {!isLoading && !errorMessage && responseData && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {responseData?.map((item, index) => (
                  <TodoCard key={index} item={item} onUpdate={handleTodoUpdate} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      {
                        length: Math.min(5, pagination.lastPage),
                      },
                      (_, i) => {
                        let pageNum;
                        if (pagination.lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.lastPage - 2) {
                          pageNum = pagination.lastPage - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              pageNum === pagination.currentPage
                                ? 'bg-theme-600 text-white'
                                : 'bg-brand-600 text-white hover:bg-brand-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                    className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center mt-4 text-brand-300 text-sm">
                Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
                {pagination.total} todos
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default TodoList;
