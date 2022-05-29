/**
 * <p> This is Search Box component with filter key and value suggestions with pagination for table</p>
 * <p> This component also shows filters in chip. </p>
 * @public
 * @class
 * @author Aman Harde
 * @since 1.0.0
 * @param {Props} props
 *
 */

import React, { Component, Fragment } from "react";
import clsx from 'clsx';
import { Button, Chip, CircularProgress, ClickAwayListener, colors, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormHelperText, Grid, IconButton, InputAdornment, List, ListItem, ListItemText, Pagination, Paper, Popper, TextField, Typography } from "@mui/material";
import { AppliedFilter, FilterOption, PageRequest, ShowingResults, Suggestion, SuggestionValues } from "./intefaces";
import { URLSearchParamsInit, useLocation, useSearchParams } from "react-router-dom";
import { genearateSaveFilterResults, genearateSearchQuery, generateAppliedFilters, generateDateKeys, getDaysDifference, getFilteredSuggestions, getKeySuggestions, getKeySuggestionsByPattern } from "./utils";
import moment from "moment";

import { Location } from "history";
import { createTheme } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import { parse } from "query-string";

/* import { ReactComponent as SaveFilter } from './assects/svgs/save-filter.svg';
import { ReactComponent as ClearFilter } from './assects/svgs/clear-filter.svg'; */

const theme = createTheme();

const useStyles = {
  root: {
    alignItems: "center",
    padding: theme.spacing(1),
    display: "flex",
    flexBasis: 420,
  },
  icon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  input: {
    flexGrow: 1,
    fontSize: "14px",
    lineHeight: "16px",
    letterSpacing: "-0.05px",
  },
  searchButton: {
    marginLeft: theme.spacing(1),
  },
  popover: {
    marginTop: 10,
    zIndex: 1200
  },
  activeList: {
    background: "whitesmoke",
    fontWeight: 600,
  },
  listHover: {
    "&:hover": {
      background: "whitesmoke",
      fontWeight: 600,
    },
  },
  pagination: {
    float: "right",
  },
  rotateIcon: {
    animation: 'rotation 2s infinite linear'
  },
  invalidChip: {
    borderColor: theme.palette.error.dark,
    backgroundColor: colors.red[50]
  },
  invalidChipIcon: {
    color: theme.palette.error.dark,
  },
  dateSelector: {
    padding: 'inherit',
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(0)
  },
  chip: {
    margin: theme.spacing(0.5)
  },
};

interface State {
  patternSuggestions: FilterOption[],
  filteredKeys: FilterOption[],
  filteredSuggestions: SuggestionValues[],
  appliedFilters: AppliedFilter[],
  date: any,
  userInput: string,
  listKeyIndex: number,
  listValueIndex: number,
  anchorEl: null | any,
  selectedKey: FilterOption,
  isShowSaveFilterModal: boolean,
  filterTitle: string,
  isDataLoaded: boolean,
  waitForSaveFilter: boolean,
  pageRequest: PageRequest,
  dateError: string,
};


interface Props {
  /**
   * keys to select for apply filter on FilterOption
   */
  keys: FilterOption[],
  /**
   * suggestions to display suggestion for apply filter with selected key
   */
  suggestions: Suggestion[],
  /**
   * allowPagination for enable panination 
   * Show Pagination to change page
   */
  allowPagination?: boolean,
  /**
   * totalPages for enable pagination display pagination and change pages
   * It works when `allowPagination` is `true`
   */
  totalPages?: number,
  /**
   * collectionName for enable save filters funtionality
   */
  collectionName?: string,
  /**
   * fetchSavedFilter funtion to get saved filters callback
   * Works when `collectionName` pass
   */
  fetchSavedFilter: () => void,
  /**
   * onFilterChange funtion to apply filters callback
   */
  onFilterChange: (appliedFilters: AppliedFilter[], pageRequest?: PageRequest) => Promise<any>,
  /**
   * onSuggestionChange  callback funtions works when suggestionType is dynamic
   */
  onSuggestionChange?: (selectedKey: FilterOption, value: string) => Promise<SuggestionValues[]> | any,
  /**
   * showingResults to show all numberOfElements and totalElemnts on current page
   * It works when `allowPagination` is `true`
   */
  showingResults?: ShowingResults,
  classes?: any
}
interface SearchParamsProps {
  searchParams: [searchParams: URLSearchParams, setSearchParams: (nextInit: URLSearchParamsInit, navigateOptions?: {
    replace?: boolean;
    state?: any;
  }) => void]
}
interface _Location {
  location: Location
}

class SearchBar extends React.Component<Props & _Location & SearchParamsProps, State> {
  private filterTextFieldRef = React.createRef<HTMLInputElement>();
  constructor(props: Props & _Location & SearchParamsProps) {

    super(props);
    this.state = {
      patternSuggestions: [],
      filteredKeys: [],
      filteredSuggestions: [],
      appliedFilters: [],
      date: {},
      userInput: "",
      listKeyIndex: 0,
      listValueIndex: 0,
      anchorEl: null,
      selectedKey: {} as FilterOption,
      isShowSaveFilterModal: false,
      filterTitle: "",
      isDataLoaded: false,
      waitForSaveFilter: false,
      pageRequest: {
        page: 1,
        size: 20,
      },
      dateError: ""
    };
  }

  focusSearchTextField() {
    this.filterTextFieldRef.current!.focus();
  }

  async componentDidMount() {

    console.log(this.props)
    const { keys, suggestions, location } = this.props;
    const { pageRequest } = this.state;

    const searchObject = parse(location.search.split("?")[1]);
    const filterObj = generateAppliedFilters({ searchObject, keys, suggestions, pageRequest });

    await this.setState({
      ...this.state,
      appliedFilters: filterObj.appliedFilters,
      pageRequest: {
        ...filterObj.pageRequest,
        page: filterObj.pageRequest.page,
      },
    });
    await this.onFiltersApply(filterObj.appliedFilters, filterObj.pageRequest);
    this.props.fetchSavedFilter !== undefined && this.props.fetchSavedFilter();
    this.focusSearchTextField();
  }

  async componentDidUpdate(prevProps: any, prevState: State) {
    const { keys, suggestions, location } = this.props;
    const { pageRequest } = this.state;
    const searchObject = parse(location.search.split("?")[1]);

    if (prevProps.location.key !== location.key) {
      const filterObj = generateAppliedFilters({ searchObject, keys, suggestions, pageRequest });

      await this.setState({
        ...this.state,
        appliedFilters: filterObj.appliedFilters,
        pageRequest: {
          ...filterObj.pageRequest,
          page: filterObj.pageRequest.page,
        }
      });
      await this.onFiltersApply(filterObj.appliedFilters, filterObj.pageRequest);
      await this.handleClickAway();
    }
  }

  // On filter apply 
  onFiltersApply = (appliedFilter: AppliedFilter[], pageRequest?: PageRequest,) => {
    this.setState({
      ...this.state,
      isDataLoaded: true
    });

    this.props.onFilterChange(appliedFilter, pageRequest).then((response: any) => {
      this.setState({
        ...this.state,
        isDataLoaded: false
      });
    }).catch((error: any) => {
      this.setState({
        ...this.state,
        isDataLoaded: false
      });
    });
  }

  handleClickAway = () => {
    this.setState({
      anchorEl: null,
      listKeyIndex: 0,
      listValueIndex: 0,
      filteredKeys: [],
      filteredSuggestions: [],
      patternSuggestions: [],
      date: {},
      isShowSaveFilterModal: false,
      waitForSaveFilter: false,
      filterTitle: '',
      dateError: ''
    });
    this.filterTextFieldRef.current!.blur();
  };

  // on user click in text field
  onInputClick = (event: any) => {
    const userInput = event.target.value;
    const userInputValue = userInput.split(" :")[1];
    const { keys, suggestions } = this.props;
    const { selectedKey } = this.state;

    // show suggestions 
    if (userInput.length === 0) {
      const filteredKeys = getKeySuggestions({ keys, userInput });
      this.setState({
        ...this.state,
        filteredKeys,
        anchorEl: event.currentTarget,
        listKeyIndex: 1
      });
    } else if (/ :/g.test(userInput)) {
      let filteredSuggestions: SuggestionValues[];
      switch (selectedKey.type) {
        case 'date_range':
        case 'date':
          filteredSuggestions = [];
          break;

        default:
          filteredSuggestions = getFilteredSuggestions({
            suggestions,
            userInput,
            userInputValue
          });
          break;
      }
      this.setState({
        ...this.state,
        filteredSuggestions,
        anchorEl: event.currentTarget,
        listValueIndex: 1
      });
    } else {
      this.setState({
        ...this.state,
        patternSuggestions: getKeySuggestionsByPattern({ keys, userInput }),
        filteredKeys: getKeySuggestions({ keys, userInput }),
        userInput,
        anchorEl: event.currentTarget,
        listKeyIndex: 1
      });
    }
  }

  // on user types in text field
  onInputChange = async (event: any) => {
    const { keys, suggestions, onSuggestionChange } = this.props;
    const { selectedKey } = this.state;
    const currentTarget = event.currentTarget;
    const userInput = event.currentTarget.value;
    const userInputValue = userInput.split(" :")[1];

    // if user input key for suggestion 
    if (/ :/g.test(userInput) && selectedKey.type === "suggestion") {
      if (selectedKey.suggestionType === 'dynamic') {
        onSuggestionChange !== undefined && onSuggestionChange(selectedKey, userInputValue).then((res: SuggestionValues[]) => {

          this.setState({
            ...this.state,
            filteredSuggestions: res,
            userInput: userInput,
            anchorEl: currentTarget,
            listKeyIndex: 1
          });
        }).catch((error: any) => {
          this.setState({
            ...this.state,
            filteredSuggestions: [],
            userInput: userInput,
            anchorEl: currentTarget,
          });
        })

      } else {
        await this.setState({
          ...this.state,
          filteredSuggestions: getFilteredSuggestions({ suggestions, userInput, userInputValue }),
          userInput: event.currentTarget.value,
          anchorEl: event.currentTarget,
          listValueIndex: 1
        });
      }
    } else {
      const filteredKeys = getKeySuggestions({ keys, userInput })
      if (filteredKeys.length === 0) {
        await this.setState({
          ...this.state,
          patternSuggestions: getKeySuggestionsByPattern({ keys, userInput }),
          filteredKeys: [],
          userInput: event.currentTarget.value,
          anchorEl: event.currentTarget,
          listKeyIndex: 1
        });
      } else {
        await this.setState({
          ...this.state,
          filteredKeys,
          patternSuggestions: [],
          userInput: event.currentTarget.value,
          anchorEl: event.currentTarget,
          listKeyIndex: 1
        });
      }
    }
  };

  // on user select key using mouse click 
  onKeySelection = (key: FilterOption) => async (event: any) => {
    const { suggestions, onSuggestionChange } = this.props;
    const userInput = key.label + " :";
    const userInputValue = "";

    const selectedKey: FilterOption = {
      label: key.label,
      value: key.value,
      type: key.type,
      maxDays: key.maxDays,
      suggestionType: key.suggestionType,
      pattern: key.pattern
    };

    await this.setState({
      selectedKey
    });

    switch (key.type) {
      case 'suggestion':
        if (selectedKey.suggestionType === 'dynamic') {
          onSuggestionChange !== undefined && onSuggestionChange(selectedKey, userInputValue).then((res: SuggestionValues[]) => {
            this.setState({
              ...this.state,
              filteredKeys: [],
              filteredSuggestions: res,
              userInput: userInput,
              listValueIndex: 1
            });
          }).catch(() => {
            this.setState({
              ...this.state,
              filteredKeys: [],
              filteredSuggestions: [],
              userInput: userInput
            });
          })
        } else {
          await this.setState({
            ...this.state,
            filteredKeys: [],
            filteredSuggestions: getFilteredSuggestions({ suggestions, userInput, userInputValue }),
            userInput: userInput,
            listValueIndex: 1
          });
        }

        break;

      case 'date_range':
      case 'date':
        await this.setState({
          ...this.state,
          filteredKeys: [],
          userInput: userInput,
          date: generateDateKeys({ suggestions, selectedKey })
        });

        break;

      default:

        await this.setState({
          ...this.state,
          userInput: userInput,
          filteredKeys: [],
        });

        this.handleClickAway();
        break;
    }
    this.focusSearchTextField();
  };

  //on user click on suggestions using mouse
  onSuggestionClick = (value: SuggestionValues) => async (event: any) => {
    const { appliedFilters, pageRequest, selectedKey } = this.state;

    const pagination = {
      ...pageRequest,
      page: 1,
    };

    const filterObj: AppliedFilter = {
      key: selectedKey.value,
      label: selectedKey.label,
      value: '',
      selectedSuggestion: value,
      type: selectedKey.type,
      isValid: true
    };

    const appliedFilter = appliedFilters.concat(filterObj);
    await this.setState({
      ...this.state,
      filteredSuggestions: [],
      userInput: "",
    });

    this.props.searchParams[1](
      genearateSearchQuery({ pageRequest: pagination, appliedFilters: appliedFilter, allowPagination: this.props.allowPagination }),
    );

    await this.handleClickAway();
  };


  //on user click on pattern suggestions using mouse
  onPatternSuggestionClick = (key: FilterOption) => async (event: any) => {
    const { appliedFilters, pageRequest, selectedKey, userInput } = this.state;
    const pagination = {
      ...pageRequest,
      page: 1,
    };

    const filterObj: AppliedFilter = {
      key: key.value,
      label: key.label,
      value: userInput,
      selectedSuggestion: null,
      type: key.type,
      isValid: true
    };

    const appliedFilter = appliedFilters.concat(filterObj);
    await this.setState({
      ...this.state,
      filteredSuggestions: [],
      userInput: "",
    });

    this.props.searchParams[1](
      genearateSearchQuery({ pageRequest: pagination, appliedFilters: appliedFilter, allowPagination: this.props.allowPagination }),
    );

    await this.handleClickAway();
  };

  onTitleChange = (event: any) => {
    this.setState({
      ...this.state,
      filterTitle: event.target.value
    });
  };

  // on press  enter usng keyboard
  onEnterPress = async (event: any) => {
    const { suggestions, allowPagination, onSuggestionChange } = this.props;
    const { listKeyIndex, listValueIndex, userInput, appliedFilters, filteredKeys, filteredSuggestions, patternSuggestions, selectedKey, pageRequest } = this.state;

    const pagination = {
      ...pageRequest,
      page: 1,
    };

    const filterObj: AppliedFilter = {
      key: selectedKey.value,
      label: selectedKey.label,
      type: selectedKey.type,
      value: "",
      selectedSuggestion: null,
      isValid: true
    };

    if (userInput !== "" && / :/g.test(userInput) && userInput.split(" :")[1] !== "") {

      filterObj.value = userInput.split(" :")[1];

      const appliedFilter = appliedFilters.concat(filterObj);

      this.setState({
        ...this.state,
        userInput: "",
        selectedKey: {} as FilterOption,
      });

      this.props.searchParams[1](
        genearateSearchQuery({ pageRequest: pagination, appliedFilters: appliedFilter, allowPagination: allowPagination }),
      );
    } else if (filteredKeys.length !== 0) {
      if (listKeyIndex !== 0) {
        const _selectedKey = filteredKeys[listKeyIndex - 1];

        switch (_selectedKey.type) {
          case 'date':
          case 'date_range':
            const date = generateDateKeys({ suggestions, selectedKey: _selectedKey });

            await this.setState({
              userInput: _selectedKey.label + " :",
              filteredKeys: [],
              selectedKey: _selectedKey,
              date
            });
            break;

          default:
            if (_selectedKey.suggestionType === 'dynamic') {
              onSuggestionChange !== undefined && onSuggestionChange(_selectedKey, '').then((res: SuggestionValues[]) => {
                this.setState({
                  ...this.state,
                  filteredSuggestions: res,
                  filteredKeys: [],
                  listKeyIndex: 0,
                  listValueIndex: 1,
                  userInput: _selectedKey.label + " :",
                  selectedKey: _selectedKey,
                });
              }).catch(() => {
                this.setState({
                  ...this.state,
                  filteredSuggestions: [],
                  filteredKeys: [],
                  listKeyIndex: 0,
                  userInput: _selectedKey.label + " :",
                  selectedKey: _selectedKey,
                });
              })
            } else {
              this.setState({
                filteredSuggestions: getFilteredSuggestions({ suggestions, userInput: _selectedKey.label, userInputValue: "" }),
                filteredKeys: [],
                listKeyIndex: 0,
                listValueIndex: 1,
                userInput: _selectedKey.label + " :",
                selectedKey: _selectedKey,
              });
            }
            break;
        }
      }
    } else if (filteredSuggestions.length !== 0) {

      if (listValueIndex !== 0) {

        filterObj.selectedSuggestion = filteredSuggestions[listValueIndex - 1];

        const appliedFilter = appliedFilters.concat(filterObj);
        await this.setState({
          listValueIndex: 0,
          filteredSuggestions: [],
          userInput: ""
        });

        this.props.searchParams[1](
          genearateSearchQuery({ pageRequest: pagination, appliedFilters: appliedFilter, allowPagination: allowPagination }),
        );

        await this.handleClickAway();
      }
    } else if (patternSuggestions.length !== 0) {
      if (listKeyIndex !== 0) {
        const _patternSelectedKey = patternSuggestions[listKeyIndex - 1];
        const filterObj: AppliedFilter = {
          key: _patternSelectedKey.value,
          label: _patternSelectedKey.label,
          value: userInput,
          selectedSuggestion: null,
          type: _patternSelectedKey.type,
          isValid: true
        };

        const appliedFilter = appliedFilters.concat(filterObj);
        await this.setState({
          ...this.state,
          filteredSuggestions: [],
          userInput: "",
        });

        this.props.searchParams[1](
          genearateSearchQuery({ pageRequest: pagination, appliedFilters: appliedFilter, allowPagination: allowPagination }),
        );

        await this.handleClickAway();
      }
    }
  }

  onArrowUpPress = async (event: any) => {

    const { listKeyIndex, listValueIndex, filteredKeys, filteredSuggestions, patternSuggestions } = this.state;

    if (filteredKeys.length !== 0) {
      if (listKeyIndex === 0) {
        await this.setState({ listKeyIndex: filteredKeys.length });
      } else {
        this.setState({ listKeyIndex: listKeyIndex - 1 });
      }
    } else if (filteredSuggestions.length !== 0) {
      if (listValueIndex === 0) {
        await this.setState({ listValueIndex: filteredSuggestions.length });
      } else {
        this.setState({ listValueIndex: listValueIndex - 1 });
      }
    } else if (patternSuggestions.length !== 0) {
      if (listKeyIndex === 0) {
        await this.setState({ listKeyIndex: patternSuggestions.length });
      } else {
        this.setState({ listKeyIndex: listKeyIndex - 1 });
      }
    }
  }

  onArrowDownPress = async (event: any) => {

    const { listKeyIndex, listValueIndex, filteredKeys, filteredSuggestions, patternSuggestions } = this.state;

    if (filteredKeys.length !== 0) {
      if (listKeyIndex === filteredKeys.length) {
        this.setState({
          listKeyIndex: 1,
        });
      } else {
        this.setState({ listKeyIndex: listKeyIndex + 1 });
      }
    } else if (filteredSuggestions.length !== 0) {
      if (listValueIndex === filteredSuggestions.length) {
        this.setState({
          listValueIndex: 1,
        });
      } else {
        this.setState({ listValueIndex: listValueIndex + 1 });
      }
    } else if (patternSuggestions.length !== 0) {
      if (listKeyIndex === patternSuggestions.length) {
        this.setState({
          listKeyIndex: 1,
        });
      } else {
        this.setState({ listKeyIndex: listKeyIndex + 1 });
      }
    }
  }

  onSearchClick = (event: any) => {
    this.onEnterPress(event);
  }

  // on keyboard key press
  onKeyEvent = async (event: any) => {

    switch (event.keyCode) {
      case 13:
        await this.onEnterPress(event);

        break;

      case 38:
        await this.onArrowUpPress(event);

        break;

      case 40:
        await this.onArrowDownPress(event);

        break;

      default:
        break;
    }

  };

  onSaveFilterButtonClick = () => {
    const { appliedFilters } = this.state;
    let request = {
      title: this.state.filterTitle,
      name: this.props.collectionName,
      values: genearateSaveFilterResults({ appliedFilters: appliedFilters }),
    };

    /*     saveFilterRequest(request).then((response: AxiosResponse<any>) => {
          this.setState({
            ...this.state,
            isShowSaveFilterModal: false,
          });
          this.props.fetchSavedFilter()
        }).catch((err: any) => {
          this.setState({
            ...this.state,
            isShowSaveFilterModal: false,
          });
        }); */
  }
  // on chip delete
  handleChipDelete = (event: any, index: number) => {
    let appliedFilters = this.state.appliedFilters;
    let pageRequest = {
      page: 1,
      size: this.state.pageRequest.size,
    };

    appliedFilters.splice(index, 1);

    this.props.searchParams[1](
      genearateSearchQuery({ pageRequest, appliedFilters, allowPagination: this.props.allowPagination }),
    );

  };

  // on clear all icon click
  onClearAllFilters = (event: any) => {
    let pageRequest = {
      page: 1,
      size: this.state.pageRequest.size,
    };

    this.props.searchParams[1](
      genearateSearchQuery({ pageRequest, appliedFilters: [], allowPagination: this.props.allowPagination }),
    );
  };

  onSaveAppliedFilterClick = () => {
    this.setState({
      ...this.state,
      isShowSaveFilterModal: true,
    });
  };

  // on date change
  handleDateChange = (key: string) => (value: moment.Moment) => {
    this.setState({
      ...this.state,
      date: {
        ...this.state.date,
        [key]: moment(value).format("YYYY-MM-DD")
      },
      dateError: ""
    });
  }

  // on ok button click from date picker
  handleOKDatePicker = (event: any) => {
    const { suggestions } = this.props
    const { appliedFilters, date, selectedKey, pageRequest } = this.state;

    const pagination = {
      ...pageRequest,
      page: 1,
    };
    const filterObj: AppliedFilter = {
      key: selectedKey.value,
      label: selectedKey.label,
      type: selectedKey.type,
      value: "",
      selectedSuggestion: {} as SuggestionValues,
      isValid: true
    };

    switch (selectedKey.type) {
      case 'date_range':
        if (selectedKey?.maxDays !== undefined) {
          if (getDaysDifference(date) < selectedKey?.maxDays) {
            for (let i in suggestions) {
              if (selectedKey.value === suggestions[i].ref) {
                for (let j in suggestions[i].values) {
                  filterObj.selectedSuggestion = suggestions[i].values[j];
                  filterObj.selectedSuggestion.valueMember = date;
                }
                break;
              }
            }
          } else {
            filterObj.isValid = false;
          }
        } else {
          for (let i in suggestions) {
            if (selectedKey.value === suggestions[i].ref) {
              for (let j in suggestions[i].values) {
                filterObj.selectedSuggestion = suggestions[i].values[j];
                filterObj.selectedSuggestion.valueMember = date;
              }
              break;
            }
          }
        }

        break;

      case 'date':
        filterObj.value = date[selectedKey.value];
        break;

      default:
        break;
    }

    if (filterObj.isValid) {
      const appliedFilter = appliedFilters.concat(filterObj);

      this.setState({
        userInput: "",
        selectedKey: {} as FilterOption,
      });

      this.props.searchParams[1](
        genearateSearchQuery({ pageRequest: pagination, appliedFilters: appliedFilter, allowPagination: this.props.allowPagination }),
      );
    } else {
      this.setState({
        dateError: `Date range should be not more than ${selectedKey?.maxDays} days`
      });
    }


  };

  // on cancle button click from date picker
  handleCancleDatePicker = (event: any) => {
    this.setState({
      userInput: "",
      selectedKey: {} as FilterOption,
    });

    this.handleClickAway();
  };

  // handle pagination
  handlePaginationChange = (event: any, page: number) => {
    const { appliedFilters } = this.state;
    const pageRequest = {
      page: page,
      size: this.state.pageRequest.size,
    };

    this.props.searchParams[1](
      genearateSearchQuery({ pageRequest, appliedFilters, allowPagination: this.props.allowPagination }),
    );
  };

  // on reload icon click
  onReloadButtonClick = (event: any) => {
    this.onFiltersApply(this.state.appliedFilters, this.state.pageRequest);
  }

  render() {
    const { classes, totalPages, showingResults, collectionName, allowPagination } = this.props;
    const { patternSuggestions, filteredKeys, filteredSuggestions, userInput, listValueIndex, listKeyIndex, appliedFilters, date, anchorEl, selectedKey, pageRequest, isShowSaveFilterModal, isDataLoaded, waitForSaveFilter, dateError } = this.state;

    let PatternSuggetionList;
    if (patternSuggestions.length && !filteredKeys.length) {
      PatternSuggetionList = (
        <ClickAwayListener onClickAway={this.handleClickAway}>
          <Popper
            open={patternSuggestions.length !== 0}
            anchorEl={anchorEl}
            placement={"bottom-start"}
            transition
            //   onClose={this.handleClickAway}
            className={classes.popover}
          >
            <List component={Paper} dense elevation={24}>
              <ListItem className="pl-2" divider>
                <Typography variant="subtitle2">{`Search With:`}</Typography>
              </ListItem>
              {patternSuggestions.map((key, index) => {
                return (
                  <ListItem
                    button
                    className={
                      index + 1 === listKeyIndex
                        ? classes.activeList
                        : classes.listHover
                    }
                    key={index + 1}
                    onClick={this.onPatternSuggestionClick(key)}
                  >
                    <ListItemText primary={key.label} />
                  </ListItem>
                );
              })}
            </List>
          </Popper>
        </ClickAwayListener>
      );
    }

    let KeyList;
    if (filteredKeys.length) {
      KeyList = (
        <ClickAwayListener onClickAway={this.handleClickAway}>
          <Popper
            open={filteredKeys.length !== 0}
            anchorEl={anchorEl}
            placement={"bottom-start"}
            transition
            //   onClose={this.handleClickAway}
            className={classes.popover}
          >
            <List component={Paper} dense elevation={24}>
              {filteredKeys.map((key, index) => {
                return (
                  <ListItem
                    button
                    className={
                      index + 1 === listKeyIndex
                        ? classes.activeList
                        : classes.listHover
                    }
                    key={index + 1}
                    onClick={this.onKeySelection(key)}
                  >
                    <ListItemText primary={key.label} />
                  </ListItem>
                );
              })}
            </List>
          </Popper>
        </ClickAwayListener>
      );
    }
    let SuggestionList;
    if (/ :/g.test(userInput)) {
      if (filteredSuggestions.length !== 0) {
        SuggestionList = (
          <ClickAwayListener onClickAway={this.handleClickAway}>
            <Popper
              open={filteredSuggestions.length !== 0}
              anchorEl={anchorEl}
              placement={"bottom-start"}
              transition
              // onClose={this.handleClickAway}
              className={classes.popover}
            >
              <List component={Paper} dense elevation={24}>
                {filteredSuggestions.map((value, index) => {
                  return (
                    <ListItem
                      button
                      className={
                        index + 1 === listValueIndex
                          ? classes.activeList
                          : classes.listHover
                      }
                      key={index}
                      onClick={this.onSuggestionClick(value)}
                    >
                      <ListItemText primary={value.displayMember} />
                    </ListItem>
                  );
                })}
              </List>
            </Popper>
          </ClickAwayListener>
        );
      }
    }

    let dateSelector;
    if (selectedKey.type === "date_range" || selectedKey.type === "date") {
      dateSelector = (
        <Popper
          open={selectedKey.type === "date_range" || selectedKey.type === "date"}
          anchorEl={anchorEl}
          placement={"bottom-start"}
          transition
          //   onClose={this.handleClickAway}
          className={classes.popover}
        >
          <List component={Paper} elevation={24}>
            <ListItem>
              <Grid container spacing={2}>
                {
                  Object.keys(date).map((datePicker, index) => {
                    return (
                      <Grid item key={index}>
                        {/* <MuiPickersUtilsProvider utils={MomentUtils}>
                          <DatePicker
                            key={index}
                            size="small"
                            variant="inline"
                            inputVariant="outlined"
                            label={selectedKey.type === "date_range" ? (index === 0 ? "From Date" : index === 1 ? "To Date" : "Select Date") : "Select Date"}
                            format="YYYY-MM-DD"
                            autoOk={true}
                            value={date[datePicker]}
                            initialFocusedDate={new Date()}
                            disableFuture
                            minDate={index === 1 ? Object.values(date)[0] as ParsableDate : undefined}
                            onChange={this.handleDateChange(datePicker)}
                          />
                        </MuiPickersUtilsProvider> */}
                      </Grid>
                    )
                  })
                }
              </Grid>
            </ListItem>

            <FormHelperText error={dateError !== ''} className='pl-4'>
              {dateError}
            </FormHelperText>

            <Divider />
            <Grid container spacing={2} justifyContent='flex-end' className={classes.dateSelector}>
              <Grid item>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={this.handleCancleDatePicker}
                >
                  {'Cancel'}
                </Button>
              </Grid>
              <Grid item className='mr-3'>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={this.handleOKDatePicker}
                >
                  {'Ok'}
                </Button>
              </Grid>
            </Grid>
          </List>
        </Popper >
      );
    }

    let saveFilterModal;
    if (appliedFilters.length !== 0 && isShowSaveFilterModal) {
      saveFilterModal = (
        <Dialog
          open={isShowSaveFilterModal}
          onClose={this.handleClickAway}
          maxWidth="sm"
          fullWidth
          ///disableBackdropClick
          disableEscapeKeyDown={waitForSaveFilter}
        >
          <DialogTitle>
            <Grid container spacing={1} alignItems='center'>
              <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                {/*   <SaveFilter fill={theme.palette.common.white} height={30} width={30} /> */}
              </Grid>
              <Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
                <Typography variant='h6' color='secondary'> {'Save Filters'}  </Typography>
              </Grid>
            </Grid>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <TextField
                  size="small"
                  variant="outlined"
                  id="filter-title"
                  label="Filter Name"
                  placeholder='Give a name to save the filter'
                  fullWidth
                  value={this.state.filterTitle}
                  onChange={this.onTitleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant='subtitle1'>{'Applied Filters:'}</Typography>
                {appliedFilters.map((chipValue, index) => (
                  <Chip
                    className={classes.chip}
                    key={index}
                    variant="outlined"
                    size="medium"
                    label={
                      <span>
                        <strong>
                          {chipValue.label + ": "}
                        </strong>
                        <span>
                          {chipValue.type === "date"
                            ? `${chipValue.value.fromDate} - ${chipValue.value.toDate}`
                            : chipValue.value}
                        </span>
                      </span>
                    }
                  />
                ))}
              </Grid>

              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                {/*  <Typography variant='subtitle2'>
                   {'Records found using this filter: '}
                   {this.props.showingResults.totalElements === 0 ? 'No Results found' : this.props.showingResults.totalElements}
                 </Typography> */}
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={this.handleClickAway}
              disabled={waitForSaveFilter}
            >
              {'Cancel'}
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={this.onSaveFilterButtonClick}
              disabled={waitForSaveFilter}
              endIcon={waitForSaveFilter && <CircularProgress color={waitForSaveFilter ? 'primary' : 'inherit'} size={20} />}
            >
              {'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      )
    }

    return (

      <Grid container spacing={1}>
        <Grid container spacing={0} item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Grid item xl={8} lg={8} md={8} sm={12} xs={12}>
            <Grid container spacing={0} item xl={12} lg={12} md={12} sm={12} xs={12} alignItems="center" >
              <Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
                <Paper className={classes.root} square elevation={4}>
                  {/*  <SearchIcon className={classes.icon} /> */}
                  <TextField
                    id="filter-search-input"
                    autoComplete="off"
                    className={classes.input}
                    inputRef={this.filterTextFieldRef}
                    onChange={this.onInputChange}
                    onKeyDown={this.onKeyEvent}
                    onClick={this.onInputClick}
                    value={userInput}
                  />
                  <Button variant='contained' color='primary' size='small' id='search' onClick={this.onSearchClick} className={classes.searchButton}>
                    {`Search`}
                  </Button>
                </Paper>
              </Grid>

              <Grid container item xl={1} lg={1} md={1} sm={1} xs={1} alignItems="center">
                <IconButton onClick={this.onReloadButtonClick} disabled={isDataLoaded} className={clsx({ [classes.rotateIcon]: isDataLoaded })} title='Refresh'>
                  {/*   <RefreshIcon /> */}
                </IconButton>

              </Grid>
              {PatternSuggetionList}
              {KeyList}
              {SuggestionList}
              {dateSelector}

            </Grid>
          </Grid>

          {
            allowPagination !== undefined &&
            <Grid container item xl={4} lg={4} md={4} sm={12} xs={12} alignItems="center" justifyItems="flex-end" >
              {
                showingResults !== undefined &&
                <Grid container item xl={4} lg={4} md={4} sm={4} xs={4} alignItems="center">
                  {/*  <Typography variant="subtitle1">
                    <strong>{GenerateShowingResult(pageRequest.page, pageRequest.size, showingResults.totalElements, showingResults.numberOfElements)}</strong>
                  </Typography> */}
                </Grid>
              }
              {
                totalPages !== undefined &&
                <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                  <Pagination
                    size="medium"
                    defaultPage={1}
                    count={totalPages}
                    page={pageRequest.page}
                    shape="rounded"
                    siblingCount={0}
                    boundaryCount={1}
                    onChange={this.handlePaginationChange}
                    className={classes.pagination}
                  />
                </Grid>
              }
            </Grid>}
        </Grid>

        {
          appliedFilters.length !== 0 &&
          <Grid container spacing={2} item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              {appliedFilters.map((chipValue, index) => (
                <Chip
                  className={clsx({ [classes.invalidChip]: !chipValue.isValid }, classes.chip)}
                  classes={{
                    deleteIcon: clsx({ [classes.invalidChipIcon]: !chipValue.isValid })
                  }}
                  key={index}
                  variant={"outlined"}
                  size="medium"
                  label={
                    <span>
                      <strong>
                        {chipValue.label + ": "}
                      </strong>
                      <span>
                        {!chipValue.isValid ? 'Invalid Value' : chipValue.value}
                      </span>
                    </span>
                  }
                  onDelete={(event) => this.handleChipDelete(event, index)}
                />
              ))}

              {appliedFilters.length !== 0 &&
                <Fragment>
                  <Divider
                    orientation="vertical"
                    className={"ml-2 mr-2"}
                    style={{
                      verticalAlign: "middle",
                      height: "32px",
                      display: "inline-flex",
                    }}
                  />

                  <IconButton onClick={this.onClearAllFilters} size='small' title='Clear all filters'>
                    {/*         <ClearFilter fill='currentColor' height={40} width={40} /> */}
                  </IconButton>

                  {
                    collectionName !== undefined &&
                    <Fragment>
                      <Divider
                        orientation="vertical"
                        className={"ml-2 mr-2"}
                        style={{
                          verticalAlign: "middle",
                          height: "32px",
                          display: "inline-flex",
                        }}
                      />

                      <IconButton onClick={this.onSaveAppliedFilterClick} title='Save filters'>
                        {/*   <SaveFilter fill='currentColor' height={25} width={25} /> */}
                      </IconButton>
                    </Fragment>
                  }

                </Fragment>
              }
            </Grid>
            {saveFilterModal}
          </Grid>
        }
      </Grid >
    );
  }
}

const withRouter = (Component: Component | any) => {
  return (props: any) => <Component {...props} location={useLocation()} searchParams={useSearchParams()} />;
}

export default React.memo(withStyles(useStyles as any)(withRouter(SearchBar)));


