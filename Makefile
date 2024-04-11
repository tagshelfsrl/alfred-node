# Define default rule at the top
all:
	@echo "Specify a command to run"

# Clean Typescript build files
clean-ts:
	@echo "Cleaning Typescript build files..."
	rm -rf ./lib

# Clean npm pack output files (*.tgz)
clean-npm-pack:
	@echo "Cleaning npm pack files..."
	rm -f *.tgz

# Clean Jest coverage files
clean-coverage:
	@echo "Cleaning Jest coverage files..."
	rm -rf coverage

# Combine all clean tasks into a single rule
clean: clean-ts clean-npm-pack clean-coverage
	@echo "All clean!"

.PHONY: all clean-ts clean-npm-pack clean-coverage clean
