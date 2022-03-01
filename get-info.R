
proj_path <- file.path(
  'C:', 'Users', 'isaac', 'Projects',
  'home-server', 'animal-sounds'
)

stim.list <- read.csv(file.path(proj_path, 'stim-list.csv'))

columns <- colnames(stim.list)

lines <- sprintf('var stim_list = [')
for (row in 1:nrow(stim.list)) {
  curr_line <- c()
  for (column in columns) {
    curr_line <- c(
      curr_line,
      sprintf('%s: "%s"', column, stim.list[row, column])
    )
  }
  curr_line <- sprintf('  {%s},', paste(curr_line, collapse = ', '))
  lines <- c(lines, curr_line)
}

lines <- c(lines, '];')

fileConn <- file(file.path(proj_path, "stim-list.js"))
writeLines(lines, fileConn)
close(fileConn)

